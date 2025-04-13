const Song = require('../../models/Artist/SongModel');

const findSongById = async (songId) => {
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('User not found');
    }
    return song;
};

module.exports = { findSongById };
