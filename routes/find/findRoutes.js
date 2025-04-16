const express = require('express')
const { authenticateToken } = require('../../middleware/authMiddleware');
const { findArtistById, findUserById, findAlbumById } = require('../../controllers/search/searchController')

const findRouter = express.Router();

findRouter.get('/Artist/:id', authenticateToken, findArtistById)
findRouter.get('/User/:id', authenticateToken, findUserById)
findRouter.get('/Album/:id', authenticateToken, findAlbumById)

module.exports = findRouter;