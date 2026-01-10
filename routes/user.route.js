const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
    likeSong,
    unLikeSong,
    likeAlbum,
    unLikeAlbum,

    getUserMy, 
    getUserById,
    getLikedCollectionById,

    changeEmail,
    changePassword,
    changeUserName,
    changeAvatar
} = require('../controllers/user.controller');
const { upload } = require('../middleware/upload.middleware');

const userRouter = express.Router();

// actions
userRouter.put('/likeSongById/:id', authenticateToken, likeSong);
userRouter.put('/unLikeSongById/:id', authenticateToken, unLikeSong);
userRouter.put('/likeAlbumById/:id', authenticateToken, likeAlbum);
userRouter.put('/unLikeAlbumById/:id', authenticateToken, unLikeAlbum);

// get
userRouter.get('/getUserMy', authenticateToken, getUserMy);
userRouter.get('/getUserById/:id', authenticateToken, getUserById);

// settings
userRouter.put('/changePasswordMy', authenticateToken, changePassword);
userRouter.put('/changeEmailMy', authenticateToken, changeEmail);
userRouter.put('/changeUserNameMy', authenticateToken, changeUserName);
userRouter.put('/changeAvatarMy', authenticateToken, upload.single('avatar'), changeAvatar);

module.exports = userRouter;