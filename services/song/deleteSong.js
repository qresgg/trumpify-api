const Song = require('../../models/Artist/SongModel');

const deleteSong = async (songId) => {
    await Song.deleteOne({ _id: songId });
};

module.exports = { deleteSong };
