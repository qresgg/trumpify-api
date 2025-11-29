const mongoose = require('mongoose')
const cloudinary = require('../middleware/upload.middleware');

const { findUserById } = require('../services/global/findUser')
const { findArtistById } = require('../services/global/findArtist')
const { parseFeatures } = require('../services/song/parseFeatures')

const { processCoverImage } = require('../services/upload/processCoverImage')
const { uploadCoverToCloudinary } = require('../services/upload/uploadCoverToCloudinary')
const { updateSongWithCover } = require('../services/upload/updateSongByCover')
const { uploadSongToCloudinary } = require('../services/upload/uploadSongToCloudinary')
const { updateSongWithSong } = require('../services/upload/updateSongBySong')

const { createSong } = require('../services/create/createSong')

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const createSongController = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const uploadedCloudinaryAssets = [];
    try {
        console.log("🔄 Song creation started");
        const { title, genre, duration, type, explicit, artists, date } = req.body;
        console.log(req.body)
        const userId = req.user.id;

        const user = await findUserById(userId);     
        console.log("👤 User found:", user._id);

        const artist = await findArtistById(user.artist_profile);
        console.log("🎨 Artist found:", artist._id);
        const features = parseFeatures(artists);

        let cleanedGenres = genre;
        if (typeof cleanedGenres === 'string') {
            cleanedGenres = JSON.parse(cleanedGenres);
        }

        const newSong = await createSong(
            { title, cleanedGenres, duration, type, explicit, features, date },
            artist,
            session
        );
        console.log("📀 New song created:", newSong._id);

        const coverFile = req.files.cover[0];
        console.log("🖼️ Cover file found");
        if (!coverFile) throw new Error('Cover image is required');

        const allowedTypesCover = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypesCover.includes(coverFile.mimetype)) throw new Error('Chosen image has unregistered type of image')

        const imageBuffer = await processCoverImage(coverFile.buffer);
        const coverResult = await uploadCoverToCloudinary(imageBuffer, newSong._id);

        await updateSongWithCover(newSong._id, coverResult.secure_url, session);
        console.log("📝 Song updated with cover");

        const allowedTypesSong = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3'];
        const audioFile = req.files.audio[0];
        if (!allowedTypesSong.includes(audioFile.mimetype)) throw new Error('Chosen audiofile has unregistered type of audio')
        const audioBuffer = audioFile.buffer;
        const audioResult = await uploadSongToCloudinary(audioBuffer, newSong._id);
        if (!audioResult?.public_id) throw new Error(`Failed to upload audio for song`);

        uploadedCloudinaryAssets.push({ public_id: audioResult.public_id, type: "video" });
        console.log(`⬆️ Song uploaded to Cloudinary: ${audioResult.secure_url}`);
        await updateSongWithSong(newSong._id, audioResult.secure_url, session);

        newSong.song_file = audioResult.secure_url;
        await newSong.save({ session });
        console.log("📥 Song created!");

        await session.commitTransaction();
        session.endSession();
        console.log("✅ Transaction committed");

        res.status(201).json({
            success: true,
            message: 'Song has been created successfully',
        });
    } catch (error) {
        console.error("❌ Error occurred:", error.message);
        await session.abortTransaction();
        session.endSession();
        console.log("⛔️ Transaction aborted");

        for (const asset of uploadedCloudinaryAssets) {
            try {
                const result = await cloudinary.uploader.destroy(asset.public_id, {
                    resource_type: asset.type
                });
                console.log(`🗑️ Cloudinary asset deleted: ${asset.public_id}, result: ${result.result}`);
            } catch (err) {
                console.error(`❗️ Failed to delete Cloudinary asset ${asset.public_id}:`, err.message);
            }
        }

        res.status(500).json({
            success: false,
            error: isDev ? error.message : 'Something went wrong. Please try again later.'
        });
    }
}

module.exports = { createSongController };
