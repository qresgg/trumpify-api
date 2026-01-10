const express = require('express')
const { authenticateToken } = require('../middleware/auth.middleware');
const { searchArtistById, searchUserById, searchArtistByName } = require('../controllers/search/searchController')
const {
    search,
    searchAlbumById
} = require('../controllers/search.controller')

const searchRouter = express.Router();

searchRouter.get('/artistById/:id', authenticateToken, searchArtistById)
searchRouter.get('/userById/:id', authenticateToken, searchUserById)
searchRouter.get('/albumById/:id', authenticateToken, searchAlbumById)

searchRouter.get('/Artist', authenticateToken, searchArtistByName)

searchRouter.get('/searchById/:id', authenticateToken, search);

module.exports = searchRouter;