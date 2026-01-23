const mongoose = require('mongoose');
const Artist = require('../../models/artist.model');
const User = require('../../models/user.model');
const Song = require('../../models/song.model');
const Album = require('../../models/album.model')
const LikedCol = require('../../models/libraryCollection.model')

const { findSongById } = require('../../services/search.main');
const { findUserById } = require('../../services/search.main');
const { findLikedColById } = require('../../services/search.main');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const sendLikedSong = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
    
        const song = await findSongById( id );
        const user = await findUserById( userId);
        const likedCol = await findLikedColById(user.library_collection);
        
        const likedSong = likedCol.songs.some(likedSongId => likedSongId.equals(song._id));

        res.send({
            isLiked: likedSong
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

module.exports = { sendLikedSong };