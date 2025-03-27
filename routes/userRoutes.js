const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { getUserData, search} = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/getUser', authenticateToken, getUserData)
userRouter.get('/search', authenticateToken, search)

module.exports = userRouter;