const express = require('express')
const { createArtist, createSong, createAlbum, uploadCover } = require("../controllers/artistController")
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload, uploadToCloudinarySongCover, uploadToCloudinaryAlbumCover } = require('../middleware/uploadMiddleware');
const { findArtistById } = require('../controllers/searchController')

const artistRouter = express.Router();

artistRouter.post('/create-artist', authenticateToken, createArtist)
artistRouter.post('/create-song', authenticateToken, upload.single('cover'), createSong, uploadToCloudinarySongCover, uploadCover)
artistRouter.post('/create-album', authenticateToken, upload.single('cover'), createAlbum, uploadToCloudinaryAlbumCover, uploadCover)

artistRouter.get('/find/:id', findArtistById)

module.exports = artistRouter;