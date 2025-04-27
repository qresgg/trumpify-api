const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getUserData, search, getAlbumData, getLikedCollection, getLibrary, getSongData} = require('../../controllers/api/apiController');

const apiRouter = express.Router();

apiRouter.get('/getUser', authenticateToken, getUserData)
apiRouter.get('/search', authenticateToken, search)

apiRouter.get('/getAlbum', authenticateToken, getAlbumData)
apiRouter.get('/getSong', authenticateToken, getSongData)
apiRouter.get('/getLikedCollection', authenticateToken, getLikedCollection)
apiRouter.get('/getLibrary', authenticateToken, getLibrary)

module.exports = apiRouter;