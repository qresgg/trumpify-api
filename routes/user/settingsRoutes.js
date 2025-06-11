const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { changePassword, changeEmail, changeUserName, uploadAvatar, changeArtistBio, changeArtistName } = require('../../middleware/settingsMiddleware');
const { upload, uploadToCloudinaryAvatar, uploadToCloudinaryArtistAvatar, uploadToCloudinaryArtistBanner } = require('../../middleware/uploadMiddleware');

const settingsRouter = express.Router();

settingsRouter.put('/change-password', authenticateToken, changePassword)
settingsRouter.put('/change-email', authenticateToken, changeEmail)
settingsRouter.put('/change-userName', authenticateToken, changeUserName)
settingsRouter.put("/change-avatar", authenticateToken, upload.single('avatar'), uploadToCloudinaryAvatar, uploadAvatar)

settingsRouter.put('/change-artist-bio', authenticateToken, changeArtistBio)
settingsRouter.put('/change-artist-name', authenticateToken, changeArtistName)
settingsRouter.put('/change-artist-avatar', authenticateToken, upload.single('avatar'), uploadToCloudinaryArtistAvatar)
settingsRouter.put('/change-artist-banner', authenticateToken, upload.single('banner'), uploadToCloudinaryArtistBanner)

module.exports = settingsRouter;