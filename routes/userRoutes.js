const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { getUserData } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/getUser', authenticateToken, getUserData)
// userRouter.put('/updateUser', authenticateToken, changeUserData)

module.exports = userRouter;