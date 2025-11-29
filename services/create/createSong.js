const Song = require('../../models/song.model');

const createSong = async (songData, artist, session) => {
    const newSong = new Song({
        title: songData.title,
        artist: artist._id,
        duration: songData.duration,
        created_at: songData.date,
        genre: songData.cleanedGenres,
        type: songData.type,
        is_explicit: songData.explicit,
        features: songData.features,
    });

    await newSong.save({ session });

    artist.songs.push(newSong);
    await artist.save({ session });

    return newSong;
};

module.exports = { createSong };