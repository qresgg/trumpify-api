const Album = require('../../models/Artist/AlbumModel');

const updateAlbumWithCover = async (albumId, coverUrl) => {
    const album = await Album.findById(albumId);
    if (!album) {
        throw new Error('Song not found');
    }
    album.cover = coverUrl;
    await album.save();
    return album;
};

module.exports = { updateAlbumWithCover };