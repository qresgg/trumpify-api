const mongoose = require('mongoose');
const Artist = require('../../models/Artist/ArtistModel');
const User = require('../../models/User/UserModel');
const Song = require('../../models/Artist/SongModel');
const Album = require('../../models/Artist/AlbumModel')

const createArtist = async (req, res) => {
    try {
        const { artistName, bio, password, confirmPassword } = req.body;
        const userId = req.user.id;
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `User not found` });
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
        const { title, genre, duration, type, explicit, artists } = req.body;
        const userId = req.user.id;

        const user = await User.findById( userId )
        if (!user) {
            return res.status(404).json({ message: 'User not found'})
        }

        const artist = await Artist.findById( user.artist_profile );
        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }

        let features = [];
        if (typeof artists === 'string') {
            try {
                const parsedArtists = JSON.parse(artists);
                console.log(parsedArtists)

                if (Array.isArray(parsedArtists)) {
                    features = parsedArtists.map(artist => ({
                        // artist: new Object('000000000000000000000000'),
                        name: artist.name,
                        roles: Array.isArray(artist.roles) 
                            ? artist.roles.flatMap(role => ({ role }))
                            : []
                    }));
                    console.log(features)
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid artists format' });
            }
        } else if (Array.isArray(artists)) {
            features = artists.map(artist => ({
                // artist: new Object('000000000000000000000000'), 
                name: artist.name,
                roles: Array.isArray(artist.roles) 
                    ? artist.roles.flatMap(role => ({ role })) 
                    : []
            }));
        }

        const newSong = new Song({
            title: title,
            artist: artist._id,
            duration: duration,
            genre: genre,
            type: type,
            is_explicit: explicit,
            features
        });

        await newSong.save();
        artist.songs.push(newSong);
        await artist.save();

        req.song = newSong;
        next();
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

const uploadFinal = async (req, res, next) => {
    try {
        if (!req.coverResult) {
            return res.status(400).json({ error: "Cover upload failed" });
        }
        if (!res.musicResult) {
            return res.status(400).json({ error: 'Music upload failed'})
        }

        const { public_id: newPublicId, secure_url: newCoverUrl } = req.coverResult;

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

module.exports = { createArtist, createSong, uploadFinal};