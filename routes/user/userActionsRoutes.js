const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { likeSong, unLikeSong} = require('../../controllers/user/userController');
const { getLikedSongs } = require('../../controllers/artist/albumController');
const actionRouter = express.Router();

actionRouter.put('/like-song', authenticateToken, likeSong)
actionRouter.put('/unlike-song', authenticateToken, unLikeSong)
actionRouter.get('/getLikedSongs/:id', authenticateToken, getLikedSongs)

module.exports = actionRouter;