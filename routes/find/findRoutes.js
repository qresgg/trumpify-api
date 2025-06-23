const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { searchArtistById, searchUserById, searchAlbumById, searchArtistByName } = require('../../controllers/search/searchController')

const findRouter = express.Router();

findRouter.get('/Artist/:id', authenticateToken, searchArtistById)
findRouter.get('/User/:id', authenticateToken, searchUserById)
findRouter.get('/Album/:id', authenticateToken, searchAlbumById)

// findRouter.get('/Artist', authenticateToken, searchArtistByName)

module.exports = findRouter;