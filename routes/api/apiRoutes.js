const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getUserData, search, getAlbumData, getLikedCollection, getLibrary, getSongData} = require('../../controllers/api/apiController');
const { getAlbumById, getUserById } = require('../../controllers/api/apiController')

const apiRouter = express.Router();

apiRouter.get('/getUser', authenticateToken, getUserData)
apiRouter.get('/search', authenticateToken, search)

apiRouter.get('/getAlbum', authenticateToken, getAlbumData)
apiRouter.get('/getSong', authenticateToken, getSongData)
apiRouter.get('/getLikedCollection', authenticateToken, getLikedCollection)
apiRouter.get('/getLibrary', authenticateToken, getLibrary)

apiRouter.get('/getAlbumById/:id', authenticateToken, getAlbumById)
apiRouter.get('/getUserById/:id', authenticateToken, getUserById)

module.exports = apiRouter;