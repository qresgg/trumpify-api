const User = require('../../models/User/UserModel')

const updateUserWithAvatar = async (userId, avatarUrl) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.url_avatar = avatarUrl;
    await user.save();
};

module.exports = { updateUserWithAvatar };