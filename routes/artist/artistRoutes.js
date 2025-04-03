const express = require('express')
const { createArtist, createSong, createAlbum, uploadCover } = require("../../controllers/artist/artistController")
const { authenticateToken } = require('../../middleware/authMiddleware');
const { upload, uploadToCloudinarySongCover, uploadToCloudinaryAlbumCover } = require('../../middleware/uploadMiddleware');
const { findArtistById } = require('../../controllers/search/searchController');
const { createSongController } = require('../../controllers/artist/songController');

const artistRouter = express.Router();

artistRouter.post('/create-artist', authenticateToken, createArtist)
artistRouter.post('/create-song', authenticateToken, upload.fields([{name: 'cover'}, { name: 'audio'}]), createSongController)
artistRouter.post('/create-album', authenticateToken, upload.fields([{ name: 'cover'}, { name: 'audio'}]), (req, res) => {
    console.log('cover', req.files.cover)
    const textData = JSON.parse(req.body.songs[0]);
    const musicFile = req.files['songs[0][musicFile]'];
    console.log('textdata', textData);
    console.log('musicfile', musicFile)
})

artistRouter.get('/find/:id', findArtistById)

module.exports = artistRouter;