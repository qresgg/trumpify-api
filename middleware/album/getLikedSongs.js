const mongoose = require('mongoose');
const Artist = require('../../models/Artist/ArtistModel');
const User = require('../../models/User/UserModel');
const Song = require('../../models/Artist/SongModel');
const Album = require('../../models/Artist/AlbumModel')
const LikedCol = require('../../models/User/LikedCollectionModel')

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
        const likedCol = await LikedCol.findById(user.liked_collection);
        if (!likedCol){ 
            return res.status(404).json({ message: 'LikedCollection not found'})
        }
        likedSongsInAlbum = album.songs.filter(songId => likedCol.songs.some(likedSongId => likedSongId.equals(songId)));

        res.status(200).json({
            likedSongsInAlbum
        })
    } catch (error) {
        console.error(error);
    }
}

module.exports = { getLikedSongs };