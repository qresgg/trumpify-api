const express = require('express')
const { createArtistProfile, createSong, createAlbum, uploadCover } = require("../controllers/artistController")
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload, uploadToCloudinarySongCover, uploadToCloudinaryAlbumCover } = require('../middleware/uploadMiddleware');

const artistRouter = express.Router();

artistRouter.post('/createProfile', authenticateToken, createArtistProfile)
artistRouter.post('/create-song', authenticateToken, upload.single('cover'), createSong, uploadToCloudinarySongCover, uploadCover)
artistRouter.post('/create-album', authenticateToken, upload.single('cover'), createAlbum, uploadToCloudinaryAlbumCover, uploadCover)

module.exports = artistRouter;