const Song = require('../../models/Artist/SongModel');

const createSong = async (songData, artist) => {
    const newSong = new Song({
        title: songData.title,
        artist: artist._id,
        duration: songData.duration,
        created_at: songData.date,
        genre: songData.genre,
        type: songData.type,
        is_explicit: songData.explicit,
        features: songData.features,
    });

    await newSong.save();

    artist.songs.push(newSong);
    await artist.save();

    return newSong;
};

module.exports = { createSong };