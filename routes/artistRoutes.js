const express = require('express')
const { createArtistProfile, createSong } = require("../controllers/artistController")
const { authenticateToken } = require('../middleware/authMiddleware');

const artistRouter = express.Router();

artistRouter.post('/createProfile', authenticateToken, createArtistProfile)
artistRouter.post('/createSong', authenticateToken, createSong)

module.exports = artistRouter;