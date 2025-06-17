const Song = require('../../models/Artist/SongModel');

const updateSongWithSong = async (songId, songUrl, session = null) => {
    const song = await Song.findById(songId);
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