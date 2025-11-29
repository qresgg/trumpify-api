const Song = require('../../models/song.model');

const updateSongWithSong = async (songId, songUrl, session) => {
    const song = await Song.findById(songId).session(session);
    if (!song) {
        throw new Error('Song not found');
    }
    song.song_file = songUrl;
    if (session) {
        await song.save({ session });
    } else {
        await song.save();
    }
    return song;
};

module.exports = { updateSongWithSong };