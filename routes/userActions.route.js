const express = require('express')
const { authenticateToken } = require('../middleware/auth.middleware');
const { likeSong, unLikeSong} = require('../controllers/user.controller');
const { getLikedSongs } = require('../middleware/album/getLikedSongs');
const { sendLikedSong } = require('../middleware/song/sendLikedSong');
const actionRouter = express.Router();

actionRouter.get('/getLikedSong/:id', authenticateToken, sendLikedSong)

module.exports = actionRouter;