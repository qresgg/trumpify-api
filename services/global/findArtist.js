const Artist = require('../../models/Artist/ArtistModel');

const findArtistById = async (artistId) => {
    const artist = await Artist.findById(artistId);
    if (!artist) {
        throw new Error('Artist not found');
    }
    return artist;
};

module.exports = { findArtistById };
