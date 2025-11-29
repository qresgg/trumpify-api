const Artist = require('../../models/artist.model');

const findArtistById = async (artistId) => {
    const artist = await Artist.findById(artistId);
    if (!artist) {
        throw new Error('Artist not found');
    }
    return artist;
};

const findArtistByName = async (artistName) => {
    const artist = await Artist.findOne({ name: artistName})
    if (artist) {
        throw new Error('Artist is already exists');
    }
    return artist;
}

const findArtistByIdNotStrict = async (artistId) => {
    const artist = await Artist.findById(artistId);
    if (!artist) {
    }
    return artist
}

module.exports = { findArtistById, findArtistByName, findArtistByIdNotStrict };
