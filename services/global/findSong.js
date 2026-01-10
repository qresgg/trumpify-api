const Song = require('../../models/song.model');

const findSongById = async (id) => {
    const song = await Song.findById(id);
    if (!song) {
        throw new Error('Song not found');
    }
    return song;
};

module.exports = { findSongById };
