const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getUserData, search, getAlbumData, getLikedCollection, getLibrary} = require('../../controllers/api/userController');

const apiRouter = express.Router();

apiRouter.get('/getUser', authenticateToken, getUserData)
apiRouter.get('/search', authenticateToken, search)
apiRouter.get('/getAlbum', authenticateToken, getAlbumData)
apiRouter.get('/getLikedCollection', authenticateToken, getLikedCollection)
apiRouter.get('/getLibrary', authenticateToken, getLibrary)

module.exports = apiRouter;