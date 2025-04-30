const User = require('../../models/User/UserModel');

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
}

const findUserByEmailExists = async (userEmail) => {
    const user = await User.findOne({ email: userEmail });
    if (user) {
        throw new Error('User is already exists');
    }
}

module.exports = { findUserById, findUserByEmail, findUserByEmailExists };
