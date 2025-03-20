const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { changePassword, changeEmail, changeUserName, uploadAvatar } = require('../middleware/settingsMiddleware');
const { upload, uploadToCloudinary } = require('../middleware/uploadMiddleware');

const settingsRouter = express.Router();

settingsRouter.put('/change-password', authenticateToken, changePassword)
settingsRouter.put('/change-email', authenticateToken, changeEmail)
settingsRouter.put('/change-userName', authenticateToken, changeUserName)
settingsRouter.put("/change-avatar", authenticateToken, upload.single('avatar'), uploadToCloudinary, uploadAvatar);

module.exports = settingsRouter;