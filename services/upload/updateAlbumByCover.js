const Album = require('../../models/Artist/AlbumModel');

const updateAlbumWithCover = async (albumId, coverUrl, session) => {
    const album = await Album.findById(albumId).session(session);
    if (!album) {
        throw new Error('Album not found');
    }
    album.cover = coverUrl;
    await album.save({ session });
    return album;
};

module.exports = { updateAlbumWithCover };