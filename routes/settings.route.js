const express = require('express')
const { authenticateToken } = require('../middleware/auth.middleware');
const { changePassword, changeEmail, changeUserName, changeArtistBio, changeArtistName } = require('../middleware/settings.middleware');
const { upload, uploadToCloudinaryAvatar, uploadToCloudinaryArtistAvatar, uploadToCloudinaryArtistBanner } = require('../middleware/upload.middleware');

const settingsRouter = express.Router();

// settingsRouter.put('/change-password', authenticateToken, changePassword)
// settingsRouter.put('/change-email', authenticateToken, changeEmail)
// settingsRouter.put('/change-userName', authenticateToken, changeUserName)
// settingsRouter.put("/change-avatar", authenticateToken, upload.single('avatar'), uploadToCloudinaryAvatar)

settingsRouter.put('/change-artist-bio', authenticateToken, changeArtistBio)
settingsRouter.put('/change-artist-name', authenticateToken, changeArtistName)
settingsRouter.put('/change-artist-avatar', authenticateToken, upload.single('avatar'), uploadToCloudinaryArtistAvatar)
settingsRouter.put('/change-artist-banner', authenticateToken, upload.single('banner'), uploadToCloudinaryArtistBanner)

module.exports = settingsRouter;