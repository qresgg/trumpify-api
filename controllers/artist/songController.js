const { findUserById } = require('../../services/global/findUser')
const { findArtistById } = require('../../services/global/findArtist')
const { parseFeatures } = require('../../services/song/parseFeatures')
const { createSong } = require('../../services/song/createSong')
const { deleteSong } = require('../../services/song/deleteSong')
const { processCoverImage } = require('../../services/upload/processCoverImage')
const { uploadCoverToCloudinary } = require('../../services/upload/uploadSongCover')
const { updateSongWithCover } = require('../../services/upload/updateSongByCover')

const createSongController = async (req, res) => {
    try {
        const { title, genre, duration, type, explicit, artists } = req.body;
        const userId = req.user.id;

        const user = await findUserById(userId);
        const artist = await findArtistById(user.artist_profile);
        const features = parseFeatures(artists);

        const newSong = await createSong(
            { title, genre, duration, type, explicit, features },
            artist
        );

        if (!req.files.cover || !req.files.cover[0].buffer) {
            await deleteSong(newSong._id);
            return res.status(400).json({ error: 'No cover file uploaded' });
        }
        const allowedTypes = ['image/jpeg', 'image/png'];
        const coverFile = req.files.cover[0];
        if (!allowedTypes.includes(coverFile.mimetype)) {
            await deleteSong(newSong._id); 
            return res.status(400).json({ error: 'Invalid cover file type' });
        }

        const imageBuffer = await processCoverImage(coverFile.buffer);
        const coverResult = await uploadCoverToCloudinary(imageBuffer, newSong._id);
        const updatedSong = await updateSongWithCover(newSong._id, coverResult.secure_url);

        res.status(201).json({
            success: true,
            message: 'Song created successfully',
            song: updatedSong,
            coverUrl: coverResult.secure_url,
        });
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createSongController };
