const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
    handleLikeSong, 
    handleUnLikeSong, 
    handleLikeAlbum, 
    handleUnLikeAlbum, 
    getUserMy, 
    getUserById, 
    getLikedCollectionMy, 
    getLikedCollectionById,
    changeEmail,
    changePassword,
    changeUserName,
    changeAvatar
} = require('../controllers/user.controller');
const { upload } = require('../middleware/upload.middleware');

const userRouter = express.Router();

// actions
userRouter.put('/likeSongById/:id', authenticateToken, handleLikeSong);
userRouter.put('/unLikeSongById/:id', authenticateToken, handleUnLikeSong);
userRouter.put('/likeAlbumById/:id', authenticateToken, handleLikeAlbum);
userRouter.put('/unLikeAlbumById/:id', authenticateToken, handleUnLikeAlbum);

// get
userRouter.get('/getUserMy', authenticateToken, getUserMy);
userRouter.get('/getUserById/:id', authenticateToken, getUserById);
userRouter.get('/getLikedCollectionMy', authenticateToken, getLikedCollectionMy);
userRouter.get('/getLikedCollectionById/:id', authenticateToken, getLikedCollectionById);

// settings
userRouter.put('/changePasswordMy', authenticateToken, changePassword);
userRouter.put('/changeEmailMy', authenticateToken, changeEmail);
userRouter.put('/changeUserNameMy', authenticateToken, changeUserName);
userRouter.put('/changeAvatarMy', authenticateToken, upload.single('avatar'), changeAvatar);

module.exports = userRouter;