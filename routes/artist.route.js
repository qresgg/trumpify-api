const express = require('express')
const { registerArtist, getPopularSongs, getArtistReleases } = require("../controllers/artist.controller")
const { authenticateToken } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createSongController } = require('../controllers/song.controller');
const { createAlbumController } = require('../controllers/album.controller')

const artistRouter = express.Router();

artistRouter.post('/create/Artist', authenticateToken, registerArtist)
artistRouter.post('/create/Song', authenticateToken, upload.fields([{ name: 'cover' }, { name: 'audio' }]), createSongController)
artistRouter.post('/create/Album', authenticateToken, upload.any(), createAlbumController);

artistRouter.get('/getPopularSongs/:id', authenticateToken, getPopularSongs)
artistRouter.get('/getArtistReleases/:id', authenticateToken, getArtistReleases)

module.exports = artistRouter;