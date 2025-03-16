const express = require('express')
const { data, register, login, logout, token, verifyToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const authRouter = express.Router();

authRouter.get('/data', data)
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/refresh', token)
authRouter.post('/verify', verifyToken)

module.exports = authRouter;