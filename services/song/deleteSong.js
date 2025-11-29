const Song = require('../../models/song.model');

const deleteSong = async (songId) => {
    await Song.deleteOne({ _id: songId });
};

module.exports = { deleteSong };
