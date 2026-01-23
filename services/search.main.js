const Album = require('../models/album.model');
const Artist = require("../models/artist.model");
const LibraryCollection = require("../models/libraryCollection.model");
const Song = require("../models/song.model");
const User = require("../models/user.model");

const findAlbumById = async (albumId) => {
    const album = await Album.findById(albumId);
    if (!album) {
        throw new Error('User not found');
    }
    return album;
};
const findAlbumByIdWithSongs = async (albumId) => {
    const album = await Album.findById(albumId).populate('songs');
    if (!album) {
        throw new Error('Album not found');
    }
    return album;
};
const findArtistById = async (artistId) => {
    const artist = await Artist.findById(artistId);
    if (!artist) {
        throw new Error('Artist not found');
    }
    return artist;
};
const findArtistByName = async (artistName) => {
    const artist = await Artist.findOne({ name: artistName})
    if (artist) {
        throw new Error('Artist is already exists');
    }
    return artist;
};
const findArtistByIdNotStrict = async (artistId) => {
    const artist = await Artist.findById(artistId);
    if (!artist) {
    }
    return artist
};
const findLibraryCollectionById = async (id) => {
    const libraryCol = await LibraryCollection.findById(id).populate('liked.songs');
    if (!libraryCol) {
        throw new Error('Library Collection not found');
    }
    return libraryCol;
};
const findLibraryCollectionByUserId = async (userId) => {
    const libraryCol = await LibraryCollection.findOne({ user_id: userId });
    if (!libraryCol) {
        throw new Error('Library Collection not found');
    }
    return libraryCol;
};
const findSongById = async (id) => {
    const song = await Song.findById(id);
    if (!song) {
        throw new Error('Song not found');
    }
    return song;
};
const findUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
const findUserByEmail = async (userEmail) => {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
const findUserByEmailExists = async (userEmail) => {
    const user = await User.findOne({ email: userEmail });
    if (user) {
        throw new Error('User is already exists');
    }
};
const findUserByLibrary = async (query) => {
    const user = await User.findOne({ library_collection: query });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

module.exports = {
    findAlbumById,
    findAlbumByIdWithSongs,
    findArtistById,
    findArtistByName,
    findArtistByIdNotStrict,
    findLibraryCollectionById,
    findLibraryCollectionByUserId,
    findSongById,
    findUserById,
    findUserByEmail,
    findUserByEmailExists,
    findUserByLibrary
};