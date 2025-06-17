const mongoose = require('mongoose')

const { findUserById } = require("../../services/global/findUser");
const { findArtistById } = require("../../services/global/findArtist");
const { findAlbumById } = require("../../services/global/findAlbum");
const { createAlbum } = require("../../services/album/createAlbum");
const { parseFeatures } = require("../../services/song/parseFeatures");
const { createSongInAlbum } = require("../../services/album/createSongInAlbum");
const { deleteSong } = require("../../services/song/deleteSong");

const { processCoverImage } = require("../../services/upload/processCoverImage");
const { uploadCoverAlbumToCloudinary } = require("../../services/upload/uploadCoverAlbumToCloudinary");
const { updateSongWithSong } = require("../../services/upload/updateSongBySong");
const { uploadSongToCloudinary } = require("../../services/upload/uploadSongToCloudinary");
const { updateAlbumWithCover } = require("../../services/upload/updateAlbumByCover");

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const createAlbumController = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const uploadedCloudinaryPublicIds = [];

    try {
        const { albumTitle, recordLabel, language, genre, type, privacy, date } = req.body
        const userId = req.user.id;

        const user = await findUserById(userId);
        const artist = await findArtistById(user.artist_profile);

        const newAlbum = await createAlbum(
            { albumTitle, recordLabel, language, genre, type, privacy, date },
            artist,
            session
        );

        const coverFile = req.files.find(file => file.fieldname === 'cover');
        if (!coverFile) throw new Error('Cover image is required');

        const imageBuffer = await processCoverImage(coverFile.buffer);
        const coverResult = await uploadCoverAlbumToCloudinary(imageBuffer, newAlbum._id);
        uploadedCloudinaryPublicIds.push(coverResult.public_id);

        await updateAlbumWithCover(newAlbum._id, coverResult.secure_url);

        const tracks = [];

        if (req.body.songs && Array.isArray(req.body.songs)) {
            for (let i = 0; i < req.body.songs.length; i++) {
                const songDataRaw = req.body.songs[i];
                const songData = JSON.parse(songDataRaw);

                if (!songData.title) throw new Error('Song must have a title');
                const features = parseFeatures(songData.artists);

                const audioFile = req.files.find(file => file.fieldname === `songs[${i}][audio]`);
                if (!audioFile) throw new Error('No audio file uploaded');

                const allowedTypesSong = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3'];
                if (!allowedTypesSong.includes(audioFile.mimetype)) throw new Error('Invalid audio file type');

                const newSong = await createSongInAlbum(songData, features, artist, coverResult.secure_url, date, session);
                const audioBuffer = audioFile.buffer;
                const audioResult = await uploadSongToCloudinary(audioBuffer, newSong._id);
                uploadedCloudinaryPublicIds.push(audioResult.public_id);

                await updateSongWithSong(newSong._id, audioResult.secure_url, session);

                newSong.song_file = audioResult.secure_url;
                await newSong.save({ session });

                tracks.push(newSong._id);
            }
        } else {
            throw new Error('Invalid songs data');
        }
        newAlbum.songs = tracks;
        await newAlbum.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Album created successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        for (const publicId of uploadedCloudinaryPublicIds) {
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
            } catch (err) {
                console.error(`Failed to delete Cloudinary asset ${publicId}:`, err.message);
            }
        }

        console.error('Error creating album:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const likeAlbum = async (req, res) => {
    try{ 
        const { album } = req.body;
        const userId = req.user.id;
        const user = await findUserById(userId);
        const playlist = await findAlbumById(album._id);

        user.library.push(playlist._id);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Playlist/Album has been liked successfully',
        });
    } catch (error) {
        console.error('Error liking album:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const unlikeAlbum = async (req, res) => {
    try{ 
        const { album } = req.body;
        const userId = req.user.id;
        const user = await findUserById(userId);
        const playlist = await findAlbumById(album._id);

        user.library.pull(playlist._id);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Playlist/Album has been liked successfully',
        });
    } catch (error) {
        console.error('Error liking album:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

module.exports = { createAlbumController, likeAlbum, unlikeAlbum };