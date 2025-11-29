const Album = require('../../models/album.model');

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