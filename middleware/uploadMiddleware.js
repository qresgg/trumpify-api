const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { Readable } = require("stream")
const sharp = require('sharp');
const mongoose = require('mongoose')
const path = require('path');

const User = require('../models/User/UserModel');
const Song = require('../models/Artist/SongModel')
const Album = require('../models/Artist/AlbumModel');
const { findArtistById } = require('../services/global/findArtist');
const { findUserById } = require('../services/global/findUser');
const { allowedTypesFunc } = require('../services/upload/allowedTypes');
const { processCoverImage } = require('../services/upload/processCoverImage');
const { uploadAvatarToCloudinary } = require('../services/upload/uploadAvatarToCloudinary');
const { uploadArtistAvatarToCloudinary } = require('../services/upload/uploadArtistAvatarToCloudinary') 
const { updateUserWithAvatar } = require('../services/upload/updateUserByAvatar');
const { updateArtistWithAvatar } = require('../services/upload/updateArtistByAvatar');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
});
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinaryAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await findUserById(userId);

        if (!req.file){
            return res.status(400).json({ error: "No file uploaded" });
        }
        const userAvatar = req.file

        await allowedTypesFunc(userAvatar.mimetype);
        const imageBuffer = await processCoverImage(userAvatar.buffer);
        const avatarResult = await uploadAvatarToCloudinary(imageBuffer, user._id);
        await updateUserWithAvatar(user._id, avatarResult.secure_url);

        res.status(200).json({
            message: "Avatar has been successfully updated",
            avatarUrl: avatarResult.secure_url,
        });   
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
};

const uploadToCloudinaryArtistAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const publicId = req.user.id; 

        const user = await findUserById(publicId)
        const artist = await findArtistById(user.artist_profile);

        if (!req.file){
            return res.status(400).json({ error: "No file uploaded" });
        }
        const artistAvatar = req.file

        await allowedTypesFunc(artistAvatar.mimetype);
        const imageBuffer = await processCoverImage(artistAvatar.buffer);
        const avatarResult = await uploadArtistAvatarToCloudinary(imageBuffer, artist._id);
        await updateArtistWithAvatar(artist._id, avatarResult.secure_url);
    
        res.status(200).json({
            message: "Avatar has been successfully updated",
            bannerUrl: avatarResult.secure_url,
        });   
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
};

const uploadToCloudinaryArtistBanner = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const publicId = req.user.id;
        const user = await findUserById(publicId);
        const artist = await findArtistById(user.artist_profile);

        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowedExt = ['.jpg', '.jpeg', '.png'];
        if (!allowedExt.includes(ext)) {
            return res.status(400).json({ error: 'Invalid file extension' });
        }

        const metadata = await sharp(req.file.buffer).metadata();

        const minWidth = 1200;
        const minHeight = 400;
        const maxWidth = 5000;
        const maxHeight = 2000;

        if (
            metadata.width < minWidth || metadata.height < minHeight ||
            metadata.width > maxWidth || metadata.height > maxHeight
        ) {
            return res.status(400).json({
                error: `Image dimensions must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight} pixels`,
            });
        }
        const imageBuffer = await sharp(req.file.buffer)
            .toFormat('png')
            .toBuffer();

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "artistBanners",
                    public_id: publicId,
                    format: 'png',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            Readable.from(imageBuffer).pipe(uploadStream);
        });

        artist.artist_banner = result.secure_url;
        await artist.save();

        res.status(200).json({
            message: "Banner has been successfully updated",
            bannerUrl: result.secure_url,
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message || 'Unknown server error' });
    }
};


module.exports = { upload, uploadToCloudinaryAvatar, uploadToCloudinaryArtistAvatar, uploadToCloudinaryArtistBanner };
