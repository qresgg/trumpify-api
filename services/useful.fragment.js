const bcrypt = require('bcrypt');
const {findUserById, findArtistByIdNotStrict, findLibraryCollectionById, findAlbumById} = require("./search.main");
const {buildAlbumDataMeta} = require("../utils/pattern/response.pattern");
const {createLibraryCollection} = require("./create.main");
const Song = require("../models/song.model");

const userAuthCheck = (user, res) => {
    if (!user || !user.id) {
        return res.status(400).json({ message: 'User not authenticated or user ID missing' });
    }
    console.log('Request received for user id:', user.id);
}
const likedAlbums = async (userId) => {
    const user = await findUserById(userId);
    const artist = await findArtistByIdNotStrict(userId);
    const library = await findLibraryCollectionById(user.library_collection);

    const first20libraryItems = library.liked.albums ? library.liked.albums.slice(0, 20) : [];

    const libraryItems = [];

    for (const itemId of first20libraryItems) {
        try {
            const album = await findAlbumById(itemId);
            if (album) {
                libraryItems.push(buildAlbumDataMeta(album));
            }
        } catch (error) {
            console.error(`Error finding album with ID ${itemId}:`, error);
        }
    }
    return libraryItems;
}
const verifyPassword = async (takenPass, userPass) => {
    const result = await bcrypt.compare(takenPass, userPass);
    if (!result) {
        throw Error('incorrect password');
    }
    return result;
}
const createPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

const deleteSong = async (songId) => {
    await Song.deleteOne({ _id: songId });
};
const parseFeatures = (artists) => {
    let features = [];

    if (typeof artists === 'string') {
        try {
            const parsedArtists = JSON.parse(artists);
            if (Array.isArray(parsedArtists)) {
                features = parsedArtists.map(artist => ({
                    name: artist.name,
                    roles: Array.isArray(artist.roles)
                        ? artist.roles.flatMap(role => ({ role }))
                        : []
                }));
            }
        } catch (err) {
            throw new Error('Invalid artists format');
        }
    } else if (Array.isArray(artists)) {
        features = artists.map(artist => ({
            name: artist.name,
            roles: Array.isArray(artist.roles)
                ? artist.roles.flatMap(role => ({ role }))
                : []
        }));
    }

    return features;
};

module.exports = {
    userAuthCheck,
    likedAlbums,
    verifyPassword,
    createPassword,
    deleteSong,
    parseFeatures
}