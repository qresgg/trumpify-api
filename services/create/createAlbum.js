const Album = require('../../models/album.model');

const createAlbum = async (albumData, artist, session) => {
    const newAlbum = new Album({
        title: albumData.albumTitle,
        artist: artist._id,
        record_label: albumData.recordLabel,
        privacy: albumData.privacy,
        created_at: albumData.date,
        artist_name: artist.name,
        genre: albumData.genre,
        type: albumData.type,
        language: albumData.language
    });

    await newAlbum.save({ session });

    artist.albums.push(newAlbum);
    await artist.save({ session });

    return newAlbum;
};

module.exports = { createAlbum };