const mongoose = require('mongoose');
const Artist = require('../../models/Artist/ArtistModel');
const User = require('../../models/User/UserModel');
const Song = require('../../models/Artist/SongModel');
const Album = require('../../models/Artist/AlbumModel')
const LikedCol = require('../../models/User/LikedCollectionModel')

const findUserById = require('../../services/global/findUser')
const findAlbumById = require('../../services/global/findAlbum')
const findLikedColById = require('../../services/global/findLikedCol')

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const getLikedSongs = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
    
        const album = await findAlbumById( id );
        const user = await findUserById( userId); 
        const likedCol = await findLikedColById(user.liked_collection);

        likedSongsInAlbum = album.songs.filter(songId => likedCol.songs.some(likedSongId => likedSongId.equals(songId)));

        res.status(200).json({
            likedSongsInAlbum
        })
    } catch (error) {
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

module.exports = { getLikedSongs };