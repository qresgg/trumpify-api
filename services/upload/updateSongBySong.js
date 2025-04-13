const Song = require('../../models/Artist/SongModel');

const updateSongWithSong = async (songId, songUrl) => {
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('Song not found');
    }
    song.song_file = songUrl;
    await song.save();
    return song;
};

module.exports = { updateSongWithSong };