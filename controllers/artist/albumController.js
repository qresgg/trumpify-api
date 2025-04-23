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


const createAlbumController = async (req, res) => {
    try {

        const { albumTitle, recordLabel, language, genre, type } = req.body
        const userId = req.user.id;

        const user = await findUserById(userId);
        const artist = await findArtistById(user.artist_profile);

        const newAlbum = await createAlbum(
            { albumTitle, recordLabel, language, genre, type },
            artist
        );

        const imageBuffer = await processCoverImage(req.files.find(file => file.fieldname === 'cover').buffer);
        const coverResult = await uploadCoverAlbumToCloudinary(imageBuffer, newAlbum._id);
        const updatedSongCover = await updateAlbumWithCover(newAlbum._id, coverResult.secure_url);

        const tracks = [];

        if (req.body.songs && Array.isArray(req.body.songs)) {
            for (let i = 0; i < req.body.songs.length; i++) {
                const songDataRaw = req.body.songs[i];
                const songData = JSON.parse(songDataRaw);

                if (!songData.title) {
                    return res.status(400).json({ error: 'Song must have a title' });
                }
                const features = parseFeatures(songData.artists);

                const audioFile = req.files.find(file => file.fieldname === `songs[${i}][audio]`);
                if (!audioFile) {
                    return res.status(400).json({ error: 'No audio file uploaded' });
                }
                const allowedTypesSong = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3'];
                if (!allowedTypesSong.includes(audioFile.mimetype)) { 
                    return res.status(400).json({ error: 'Invalid audio file type' });
                }
                try {
                    const newSong = await createSongInAlbum(songData, features, artist, coverResult.secure_url);

                    const audioBuffer = audioFile.buffer;
                    const audioResult = await uploadSongToCloudinary(audioBuffer, newSong._id);
                    const updatedSongAudio = await updateSongWithSong(newSong._id, audioResult.secure_url);

                    newSong.song_file = audioResult.secure_url;
                    tracks.push(newSong._id);

                    await newSong.save();
                } catch (error) {
                    console.error('Error creating or saving song:', error);
                    return res.status(500).json({ error: 'Failed to create and save song' });
                }
            }
        } else {
            res.status(400).json({ error: 'Invalid songs data' });
        }
        newAlbum.songs = tracks;
        await newAlbum.save();
        
        res.status(201).json({
            success: true,
            message: 'Album created successfully'
        });
    } catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createAlbumController, likeAlbum, unlikeAlbum };