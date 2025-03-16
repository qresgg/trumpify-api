const mongoose = require('mongoose');
const Artist = require('../models/ArtistModel');
const User = require('../models/UserModel');
const Song = require('../models/SongModel');

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
        const { title, genre, duration } = req.body;
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
        });

        newSong.save();
        artist.songs.push(newSong);
        await artist.save();

        res.status(201).json({ message: 'Song created successfully', song: newSong });
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { createArtistProfile, createSong};