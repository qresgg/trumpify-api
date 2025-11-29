const express = require('express')
const { authenticateToken } = require('../middleware/auth.middleware');
const { searchArtistById, searchUserById, searchAlbumById, searchArtistByName } = require('../controllers/search/searchController')
const { search } = require('../controllers/search.controller')

const searchRouter = express.Router();

searchRouter.get('/Artist/:id', authenticateToken, searchArtistById)
searchRouter.get('/User/:id', authenticateToken, searchUserById)
searchRouter.get('/Album/:id', authenticateToken, searchAlbumById)

searchRouter.get('/Artist', authenticateToken, searchArtistByName)

searchRouter.get('/searchById/:id', authenticateToken, search);

module.exports = searchRouter;