const mongoose = require('mongoose');
const Artist = require('../../models/Artist/ArtistModel');
const User = require('../../models/User/UserModel');
const Song = require('../../models/Artist/SongModel');
const Album = require('../../models/Artist/AlbumModel')
const LikedCol = require('../../models/User/LikedCollectionModel')

const { findSongById } = require('../../services/global/findSong');
const { findUserById } = require('../../services/global/findUser');
const { findLikedColById } = require('../../services/global/findLikedCol');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const sendLikedSong = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
    
        const song = await findSongById( id );
        const user = await findUserById( userId);
        const likedCol = await findLikedColById(user.liked_collection);
        
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