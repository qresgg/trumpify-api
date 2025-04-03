const Song = require('../../models/Artist/SongModel');

const updateSongWithCover = async (songId, coverUrl) => {
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('Song not found');
    }
    song.song_cover = coverUrl;
    await song.save();
    return song;
};

module.exports = { updateSongWithCover };