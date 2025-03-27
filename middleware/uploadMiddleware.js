const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { Readable } = require("stream")
const sharp = require('sharp');
const mongoose = require('mongoose')

const User = require('../models/UserModel');
const Song = require('../models/SongModel')
const Album = require('../models/AlbumModel')

require('dotenv').config();

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
});
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinaryAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const publicId = req.user._id;
        console.log(publicId);

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }
        const imageBuffer = await sharp(req.file.buffer)
            .toFormat('png')
            .toBuffer();

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: "userAvatars",
                    public_id: publicId,
                    format: 'png'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            Readable.from(imageBuffer).pipe(uploadStream);
        });
        
        const user = await User.findById(publicId)
        user.url_avatar = result.secure_url;
        user.save();

        req.cloudinaryResult = result;


        next();
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadToCloudinarySongCover = async (req, res, next) => {
    try {
        if (!req.file) {
            await Song.deleteOne({ _id: req.song._id})
            return res.status(400).json({ error: "No file uploaded" });
        }
        const publicId = req.song._id;

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }
        const imageBuffer = await sharp(req.file.buffer)
            .toFormat('png')
            .toBuffer();

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: "songCovers",
                    public_id: publicId,
                    format: 'png'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            Readable.from(imageBuffer).pipe(uploadStream);
        });
        
        const song = await Song.findById(publicId)
        song.song_cover = result.secure_url;
        song.save();

        req.cloudinaryResult = result;
        next();
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadToCloudinaryAlbumCover = async (req, res, next) => {
    try {
        if (!req.file) {
            await Album.deleteOne({ _id: req.album._id})
            return res.status(400).json({ error: "No file uploaded" });
        }
        const publicId = req.album._id;

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }
        const imageBuffer = await sharp(req.file.buffer)
            .toFormat('png')
            .toBuffer();

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: "albumCovers",
                    public_id: publicId,
                    format: 'png'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            Readable.from(imageBuffer).pipe(uploadStream);
        });
        
        const album = await Album.findById(publicId)
        album.cover = result.secure_url;
        await album.save();

        const songs = await Song.find({ album: new mongoose.Types.ObjectId(publicId) });
        for (const song of songs) {
            try {
                song.song_cover = result.secure_url;
                await song.save();
            } catch (err) {
                console.error(`Error updating song ${song._id}:`, err);
            }
        }
        

        req.cloudinaryResult = result;
        next();
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { upload, uploadToCloudinaryAvatar, uploadToCloudinarySongCover, uploadToCloudinaryAlbumCover };
