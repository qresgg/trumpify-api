const express = require('express')
const { createArtistProfile, createSong, createAlbum } = require("../controllers/artistController")
const { authenticateToken } = require('../middleware/authMiddleware');

const artistRouter = express.Router();

artistRouter.post('/createProfile', authenticateToken, createArtistProfile)
artistRouter.post('/createSong', authenticateToken, createSong)
artistRouter.post('/createAlbum', authenticateToken, createAlbum)

module.exports = artistRouter;