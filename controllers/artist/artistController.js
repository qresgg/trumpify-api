const mongoose = require('mongoose');
const Artist = require('../../models/Artist/ArtistModel');
const User = require('../../models/User/UserModel');
const Song = require('../../models/Artist/SongModel');
const Album = require('../../models/Artist/AlbumModel')
const { findUserById } = require("../../services/global/findUser");
const { findArtistById, findArtistByName } = require("../../services/global/findArtist");
const { findAlbumById } = require("../../services/global/findAlbum");
const { verifyPassword } = require("../../services/global/password")
const { createArtist } = require("../../services/artist/createArtist")

const registerArtist = async (req, res) => {
    try {
        const { artistName, bio, password } = req.body;
        const userId = req.user.id;

        const user = await findUserById(userId);
        await verifyPassword( password, user.password_hash );
        await findArtistByName(artistName);

        if (user.artist_profile) {
            return res.status(400).json({ message: 'You already have an artist profile' });
        }
        
        const newArtist = await createArtist(user, artistName, bio);

        res.status(201).json({ message: 'Artist profile created successfully', artist: newArtist });
    } catch (error) {
        console.error('Error creating artist profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

const getPopularSongs = async (req, res) => {
    try{ 
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Artist ID is required'});
        const songs = await Song.find({ artist: id })
            .sort({ playback: -1, created_at: -1})
            .limit(10);

        if (!songs.length) return res.status(400).json({ message: 'No songs found for this artist'});
        res.json(songs);
    } catch (error) {
        console.error('Error getting popular songs:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { registerArtist, getPopularSongs };