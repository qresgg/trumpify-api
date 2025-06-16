const express = require('express')
const { register, login, logout, token, verifyToken } = require('../../controllers/auth/authController');
const { authenticateToken } = require('../../middleware/authMiddleware');

const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/token', token)
authRouter.post('/verify', authenticateToken, verifyToken)

module.exports = authRouter;    