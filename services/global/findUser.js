const User = require('../../models/User/UserModel');
const { ObjectId } = require('mongodb');


const findUserById = async (userId) => {
    const user = await User.findById(new ObjectId(userId));
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

module.exports = { findUserById };
