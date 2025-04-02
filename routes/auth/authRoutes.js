const express = require('express')
const { register, login, logout, token, verifyToken } = require('../../controllers/auth/authController');
const { authenticateToken } = require('../../middleware/authMiddleware');

const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/refresh', token)
authRouter.post('/verify', authenticateToken, (req, res) => res.status(200).json({ message: 'access grant'}))

module.exports = authRouter;