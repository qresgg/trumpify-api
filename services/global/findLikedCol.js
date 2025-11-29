const LikedCol = require('../../models/likedCollection.model');

const findLikedColById = async (likedColId) => {
    const likedCol = await LikedCol.findById(likedColId);
    if (!likedCol) {
        throw new Error('LikedCollection not found');
    }
    return likedCol;
};

const findLikedColByUserId = async (userId) => {
    const likedCol = await LikedCol.findOne({ user_id: userId });
    if (!likedCol) {
        throw new Error('LikedCollection not found');
    }
    return likedCol;
}

module.exports = { findLikedColById, findLikedColByUserId };
