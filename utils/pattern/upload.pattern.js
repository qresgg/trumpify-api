const { findUserById } = require('../../services/search.main');
const { processCoverImage } = require('../../services/upload/processCoverImage');
const { allowedTypesFunc } = require('../../services/upload/allowedTypes');
const { uploadAvatarToCloudinary } = require('../../services/upload/uploadAvatarToCloudinary');
const { updateUserWithAvatar } = require('../../services/upload/updateUserByAvatar');

const uploadPattern = async ({ file, userId }) => {
    console.log(file)
    const user = await findUserById(userId);
    await allowedTypesFunc(file.mimetype);
    const imageBuffer = await processCoverImage(file.buffer);
    const avatarResult = await uploadAvatarToCloudinary(imageBuffer, user._id);
    await updateUserWithAvatar(user._id, avatarResult.secure_url);
    return avatarResult.secure_url;
}

module.exports = { uploadPattern };