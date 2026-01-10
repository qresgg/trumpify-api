const express = require('express')
const { authenticateToken } = require('../middleware/auth.middleware');
const { getUserData, getAlbumData, getLibrary, getSongData} = require('../controllers/api.controller');
const { getAlbumById } = require('../controllers/api.controller');
const { search } = require('../controllers/search.controller');
const { getGenres, getRegions } = require('../controllers/meta.controller');
const { getUserMy, getUserById, getLibraryCollectionById, getLikedCollectionById} = require('../controllers/user.controller');
const { getLikedSongs } = require('../middleware/album/getLikedSongs');
const {getPopularSongs, getArtistReleases, getArtistById} = require("../controllers/artist.controller");

const apiRouter = express.Router();

// reworked
apiRouter.get('/getAlbumGlobal', authenticateToken, getAlbumData);
apiRouter.get('/getSongGlobal', authenticateToken, getSongData);
apiRouter.get('/getGenresGlobal', authenticateToken, getGenres);
apiRouter.get('/getRegionsGlobal', authenticateToken, getRegions);
apiRouter.get('/getPopularSongsById/:id', authenticateToken, getPopularSongs);
apiRouter.get('/getArtistReleasesById/:id', authenticateToken, getArtistReleases);

apiRouter.get('/getUser', authenticateToken, getUserMy);
apiRouter.get('/search', authenticateToken, search);

apiRouter.get('/getAlbumById/:id', authenticateToken, getAlbumById);
apiRouter.get('/getUserById/:id', authenticateToken, getUserById);
apiRouter.get('/getArtistById/:id', authenticateToken, getArtistById)

apiRouter.get('/getLibraryMy', authenticateToken, getLibrary);
apiRouter.get('/getLikedSongsMy/:id', authenticateToken, getLikedSongs);

apiRouter.get('/getLikedCollectionById/:id', authenticateToken, getLikedCollectionById);

module.exports = apiRouter;