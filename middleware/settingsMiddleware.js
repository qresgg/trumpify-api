const User = require('../models/User/UserModel');
const bcrypt = require('bcrypt');
const Artist = require('../models/Artist/ArtistModel');
const Album = require('../models/Artist/AlbumModel');

const { findUserById } = require('../services/global/findUser');
const { findArtistById } = require('../services/global/findArtist');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const changePassword = async (req, res) => {
    try {
        const { password } = req.body;

        const userId = req.user.id;
        const user = findUserById( userId ); 
        const hashedPassword = await bcrypt.hash(password, 10); 

        user.password_hash = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password has been successfully updated' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
};

const changeEmail = async (req, res) => {
    try {
        const { email, newEmail } = req.body;

        const userId = req.user.id;
        const user = findUserById( userId );
        if (email !== user.email) {
            return res.status(400).json({ message: 'Emails do not match' });
        }

        user.email = newEmail;
        await user.save();
        res.status(200).json({ message: 'Email has been successfully updated' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const changeUserName = async (req, res) => {
    try {
        const { userName } = req.body;
        const userId = req.user.id;
        const user = await findUserById( userId );
        user.user_name = userName;
        await user.save();
        res.status(200).json({ message: 'Username has been successfully updated' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

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
    changePassword, 
    changeEmail, 
    changeUserName, 
    uploadAvatar,
    changeArtistName,
    changeArtistBio
};
