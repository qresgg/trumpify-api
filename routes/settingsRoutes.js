const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { changePassword, changeEmail } = require('../middleware/settingsMiddleware');

const settingsRouter = express.Router();

settingsRouter.put('/change-password', authenticateToken, changePassword)
settingsRouter.put('/change-email', authenticateToken, changeEmail)

module.exports = settingsRouter;