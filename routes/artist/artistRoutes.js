const express = require('express')
const { createArtist } = require("../../controllers/artist/artistController")
const { authenticateToken } = require('../../middleware/authMiddleware');
const { upload } = require('../../middleware/uploadMiddleware');
const { findArtistById } = require('../../controllers/search/searchController');
const { createSongController } = require('../../controllers/artist/songController');
const { createAlbumController } = require('../../controllers/artist/albumController')

const artistRouter = express.Router();

artistRouter.post('/create-artist', authenticateToken, createArtist)
artistRouter.post('/create-song', authenticateToken, upload.fields([{name: 'cover'}, { name: 'audio'}]), createSongController)
artistRouter.post('/create-album', authenticateToken, upload.any(), createAlbumController);


artistRouter.get('/find/:id', findArtistById)

module.exports = artistRouter;