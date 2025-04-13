const LikedCol = require('../../models/User/LikedCollectionModel');

const findLikedColById = async (likedColId) => {
    const likedCol = await LikedCol.findById(likedColId)
    if (!likedCol) {
        throw new Error('User not found');
    }
    return likedCol;
};

module.exports = { findLikedColById };
