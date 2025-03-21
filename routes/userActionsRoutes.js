const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { likeSong, unLikeSong} = require('../controllers/userController')
const actionRouter = express.Router();

actionRouter.put('/like-song', authenticateToken, likeSong)
actionRouter.put('/un-like-song', authenticateToken, unLikeSong)

module.exports = actionRouter;