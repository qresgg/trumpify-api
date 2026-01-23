const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const Artist = require('../models/artist.model');
const Album = require('../models/album.model');

const { findUserById } = require('../services/search.main');
const { findArtistById } = require('../services/search.main');

const { isValidBio } = require('../utils/validation')

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const uploadAvatar = async (req, res) => {
    try {
        if (!req.cloudinaryResult) {
            return res.status(400).json({ error: "Avatar upload failed" });
        }

        const { public_id: newPublicId, secure_url: newAvatarUrl } = req.cloudinaryResult;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "Avatar has been successfully uploaded",
            public_id: newPublicId,
            avatarUrl: newAvatarUrl,
        });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
};

const changeArtistName = async (req, res) => {
    try {
        const { artistName } = req.body;
        const userId = req.user.id;

        const user = await findUserById(userId);
        const artist = await findArtistById(user.artist_profile);

        artist.name = artistName;
        await artist.save();

        const albums = await Album.find({ artist: artist._id });
        for (const album of albums) {
            album.artist_name = artistName;
            await album.save();
        }

        res.status(200).json({ message: "Artist's name has been successfully updated" });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
};

const changeArtistBio = async (req, res) => {
    try {
        const { bio } = req.body;
        const userId = req.user.id;

        if (!bio || !isValidBio(bio)) {
            return res.status(400).json({
            error: "Biography must be up to 1000 characters and only contain letters, numbers, spaces, and punctuation (.,!?():;'-). Special symbols, HTML, or code are not allowed.",
            });
        }

        const user = await findUserById(userId);
        const artist = await findArtistById(user.artist_profile);

        artist.bio = bio;
        await artist.save();

        res.status(200).json({ message: "Bio has been successfully updated" });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
};

module.exports = { 
    uploadAvatar,
    changeArtistName,
    changeArtistBio
};
