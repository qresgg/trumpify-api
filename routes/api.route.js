const express = require('express')
const { authenticateToken } = require('../middleware/auth.middleware');
const { getUserData, getAlbumData, getLibrary, getSongData} = require('../controllers/api.controller');
const { getAlbumById } = require('../controllers/api.controller');
const { search } = require('../controllers/search.controller');
const { getGenres, getRegions } = require('../controllers/meta.controller');
const { getUserMy, getUserById, getLikedCollectionById } = require('../controllers/user.controller');
const { getLikedSongs } = require('../middleware/album/getLikedSongs');

const apiRouter = express.Router();

apiRouter.get('/getUser', authenticateToken, getUserMy);
apiRouter.get('/search', authenticateToken, search);

apiRouter.get('/getAlbum', authenticateToken, getAlbumData);
apiRouter.get('/getSong', authenticateToken, getSongData);

apiRouter.get('/getAlbumById/:id', authenticateToken, getAlbumById);
apiRouter.get('/getUserById/:id', authenticateToken, getUserById);
apiRouter.get('/getLikedCollectionById/:id', authenticateToken, getLikedCollectionById);

// reworkerd
apiRouter.get('/getLibraryMy', authenticateToken, getLibrary);
apiRouter.get('/getLikedSongsMy/:id', authenticateToken, getLikedSongs);
apiRouter.get('/getGenres', authenticateToken, getGenres);
apiRouter.get('/getRegions', authenticateToken, getRegions);

module.exports = apiRouter;