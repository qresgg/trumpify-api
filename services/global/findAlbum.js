const Album = require('../../models/Artist/AlbumModel');

const findAlbumById = async (albumId) => {
    const album = await Album.findById(albumId);
    if (!album) {
        throw new Error('User not found');
    }
    return album;
};

const findAlbumByIdWithSongs = async (albumId) => {
    const album = await Album.findById(albumId).populate('songs');
    if (!album) {
        throw new Error('Album not found');
    }
    return album;
};

module.exports = { findAlbumById, findAlbumByIdWithSongs };
