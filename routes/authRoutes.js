const express = require('express')
const { data, register, login, token } = require('../controllers/authController');

const authRouter = express.Router();

authRouter.get('/data', data)
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/token', token)
//authRouter.post('/logout', logout)

module.exports = authRouter;