const Album = require('../models/album.model');
const Artist = require("../models/artist.model");
const Song = require("../models/song.model");
const User = require("../models/user.model");
const LibraryCollection = require("../models/libraryCollection.model");

const createAlbum = async (albumData, artist, session) => {
    const newAlbum = new Album({
        title: albumData.albumTitle,
        artist: artist._id,
        record_label: albumData.recordLabel,
        privacy: albumData.privacy,
        created_at: albumData.date,
        artist_name: artist.name,
        genre: albumData.genre,
        type: albumData.type,
        language: albumData.language
    });

    await newAlbum.save({ session });

    artist.albums.push(newAlbum);
    await artist.save({ session });

    return newAlbum;
};
const createArtist = async (user, artistName, bio, region) => {
    const newArtist = new Artist({
        user_id: user._id,
        name: artistName,
        bio: bio,
        region: region
    });
    await newArtist.save();

    user.artist_profile = newArtist._id;
    await user.save();
    return newArtist;
}
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
const createUser = async (username, email, hashedPassword, session) => {
    const newUser = new User({
        user_name: username,
        email: email,
        password_hash: hashedPassword,
        created_at: Date.now(),
        url_avatar: `https://placehold.co/100x100/1F1F1F/FFFFFF?text=${username[0]}`
    });
    await newUser.save({ session });

    return newUser;
}
const createLibraryCollection = async (user, session) => {
    const newLibraryCollection = new LibraryCollection({
        user_id: user._id
    })
    await newLibraryCollection.save({ session});
    user.library_collection = newLibraryCollection._id;

    await user.save({ session });
    return newLibraryCollection;
}

module.exports = {
    createAlbum,
    createArtist,
    createSong,
    createSongInAlbum,
    createUser,
    createLibraryCollection
};