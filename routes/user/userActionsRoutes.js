const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { likeSong, unLikeSong} = require('../../controllers/api/userController');
const { getLikedSongs } = require('../../middleware/album/getLikedSongs');
const { sendLikedSong } = require('../../middleware/song/sendLikedSong');
const actionRouter = express.Router();

actionRouter.put('/like-song', authenticateToken, likeSong)
actionRouter.put('/unlike-song', authenticateToken, unLikeSong)
actionRouter.get('/getLikedSongs/:id', authenticateToken, getLikedSongs)
actionRouter.get('/getLikedSong/:id', authenticateToken, sendLikedSong)

module.exports = actionRouter;