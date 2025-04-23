const Song = require('../../models/Artist/SongModel');

const createSongInAlbum = async (songData, features, artist, cover) => {
    const newSong = new Song({
        title: songData.title,
        artist: artist._id,
        song_cover: cover,
        genre: songData.genre,
        duration: songData.duration,
        type: 'Album',
        is_explicit: songData.explicit,
        features: features,
    });

    await newSong.save();

    artist.songs.push(newSong);
    await artist.save();

    return newSong;
};

module.exports = { createSongInAlbum };