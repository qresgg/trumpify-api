const mongoose = require('mongoose');
const Artist = require('../models/ArtistModel');
const User = require('../models/UserModel');
const Song = require('../models/SongModel');
const Album = require('../models/AlbumModel')

const getLikedSongs = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
    
        const album = await Album.findById( id );
        if (!album) {
            return res.status(404).json({ message: `Album not found` });
        } 
        const user = await User.findById( userId); 
        if (!user) {
            return res.status(404).json({ message: `User not found`})
        }
        likedSongsInAlbum = album.songs.filter(songId => user.liked_songs.some(likedSongId => likedSongId.equals(songId)));

        res.status(200).json({
            likedSongsInAlbum
        })
    } catch (error) {
        console.error(error);
    }
}

module.exports = { getLikedSongs };