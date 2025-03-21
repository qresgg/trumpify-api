const mongoose = require('mongoose');
const Artist = require('../models/ArtistModel');
const User = require('../models/UserModel');
const Song = require('../models/SongModel');
const Album = require('../models/AlbumModel')

const createArtistProfile = async (req, res, next) => {
    try {
        const { artistName, bio, password, confirmPassword } = req.body;
        const userId = req.user._id;
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `User not found ${userId}424` });
        }

        const artistExists = await Artist.findOne({ name: artistName });
        if (artistExists) {
            return res.status(400).json({ message: 'Artist with this name already exists' });
        }

        if (user.artist_profile) {
            return res.status(400).json({ message: 'You already have an artist profile' });
        }

        const newArtist = new Artist({
            user_id: userId,
            name: artistName,
            bio: bio,
        });

        await newArtist.save();
        user.artist_profile = newArtist._id;
        await user.save();

        res.status(201).json({ message: 'Artist profile created successfully', artist: newArtist });

    } catch (error) {
        console.error('Error creating artist profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

const createSong = async (req, res, next) => {
    try {
        const { title, genre, duration, type, explicit } = req.body;
        const user = req.user;

        const artist = await Artist.findById( user.artist_profile );

        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }

        const newSong = new Song({
            title: title,
            artist: artist._id,
            duration: duration,
            genre: genre,
            type: type,
            is_explicit: explicit
        });

        newSong.save();
        artist.songs.push(newSong);
        await artist.save();

        req.song = newSong;
        next();
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

const createAlbum = async (req, res, next) => {
    try {
        const { albumTitle, recordLabel, language, genre, type } = req.body;
        const user = req.user;

        const artist = await Artist.findById( user.artist_profile );

        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }

        const newAlbum = new Album({
            title: albumTitle,
            artist: artist._id,
            record_label: recordLabel,
            artist_name: artist.name,
            genre: genre,
            type: type,
            language: language
        });

        await newAlbum.save();
        artist.albums.push(newAlbum);
        await artist.save();

        res.status(201).json({ message: 'Album created successfully', album: newAlbum });
        req.album = newAlbum;
        next();
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

const uploadCover = async (req, res, next) => {
    try {
        if (!req.cloudinaryResult) {
            return res.status(400).json({ error: "Cover upload failed" });
        }

        const { public_id: newPublicId, secure_url: newCoverUrl } = req.cloudinaryResult;

        res.json({
            message: "Cover uploaded successfully",
            public_id: newPublicId,
            coverUrl: newCoverUrl,
        });
    } catch (error) {
        console.error("Error uploading cover:", error);
        res.status(500).json({ error: "Failed to upload cover" });
    }
}

module.exports = { createArtistProfile, createSong, createAlbum, uploadCover};