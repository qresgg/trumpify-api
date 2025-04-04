const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getUserData, search, getAlbumData, getLikedCollection} = require('../../controllers/user/userController');
const { upload, uploadToCloudinaryMusic } = require('../../middleware/uploadMiddleware');

const apiRouter = express.Router();

apiRouter.get('/getUser', authenticateToken, getUserData)
apiRouter.get('/search', authenticateToken, search)
apiRouter.get('/getAlbum', authenticateToken, getAlbumData)
apiRouter.get('/getLikedCollection', authenticateToken, getLikedCollection)

apiRouter.post('/musicTEST', authenticateToken, upload.single('audio'), uploadToCloudinaryMusic);

module.exports = apiRouter;