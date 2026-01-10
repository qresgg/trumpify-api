const LibraryCollection = require('../../models/libraryCollection.model');

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
}

module.exports = { findLibraryCollectionById, findLibraryCollectionByUserId };
