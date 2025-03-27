
const express = require('express')
const { authenticateToken } = require('../middleware/authMiddleware');
const { getUserData, search} = require('../controllers/userController');
const { findArtistById, findUserById } = require('../controllers/searchController')

const findRouter = express.Router();

findRouter.get('/Artist/:id', authenticateToken, findArtistById)
findRouter.get('/User/:id', authenticateToken, findUserById)

module.exports = findRouter;