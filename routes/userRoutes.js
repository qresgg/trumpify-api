const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { getUserData, likeSong, unLikeSong } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/getUser', authenticateToken, getUserData)

userRouter.post('/likeSong/:id', authenticateToken, likeSong)
userRouter.post('/unLikeSong/:id', authenticateToken, unLikeSong)

module.exports = userRouter;