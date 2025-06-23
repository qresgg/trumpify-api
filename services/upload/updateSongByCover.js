const Song = require('../../models/Artist/SongModel');

const updateSongWithCover = async (songId, coverUrl, session) => {
    const song = await Song.findById(songId).session(session);
    if (!song) {
        throw new Error('Song not found');
    }
    song.song_cover = coverUrl;
    if (session) {
        await song.save({ session });
    } else {
        await song.save();
    }
    return song;
};

module.exports = { updateSongWithCover };