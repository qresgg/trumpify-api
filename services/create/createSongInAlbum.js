const Song = require('../../models/song.model');

const createSongInAlbum = async (songData, features, artist, cover, date, session, cleanedGenres) => {
    const newSong = new Song({
        title: songData.title,
        artist: artist._id,
        song_cover: cover,
        genre: cleanedGenres,
        duration: songData.duration,
        created_at: date,
        type: 'Album',
        is_explicit: songData.explicit,
        features: features,
    });

    await newSong.save({ session });

    artist.songs.push(newSong);
    await artist.save({ session });

    return newSong;
};

module.exports = { createSongInAlbum };