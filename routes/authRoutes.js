const express = require('express')
const { data, register, login, logout, token, verifyToken } = require('../controllers/authController');

const authRouter = express.Router();

authRouter.get('/data', data)
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/token', token)
authRouter.get('/verifyToken', verifyToken)

module.exports = authRouter;