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

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

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
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const getPopularSongs = async (req, res) => {
    try{ 
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Artist ID is required'});

        const artist = await findArtistById(id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        const songs = await Song.find({ artist: id })
            .sort({ playback: -1, created_at: -1})
            .limit(10);

        if (!songs.length){
            return res.status(200).json({ message: 'No songs found for this artist'})   
        } else {
            return res.status(200).json(songs);
        }
    } catch (error) {
        console.error('Error getting popular songs:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const getArtistReleases = async (req, res) => {
    try {
        const { id } = req.params;

        const artist = await findArtistById(id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        const singles = await Song.find({ artist: artist._id, type: { $ne: 'Album' } })
            .populate('features')
            .lean()
            .exec();

        const albums = await Album.find({ artist: artist._id })
            .populate({
                path: 'songs',
                populate: { path: 'features' }
            })
            .lean()
            .exec();

        const albumSongs = albums.flatMap(album => {
            const songs = (album.songs || []).slice(0, 2);
            return songs.map(song => ({
                ...song,
                albumTitle: album.title,
                type: 'Album'
            }));
        });

        const albumsWithType = albums.map(album => ({ ...album, type: 'album' }));

        const allReleases = [
            ...albumsWithType,
            ...singles.map(single => ({ ...single, type: 'single' })),
            ...albumSongs
        ];

        allReleases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (!allReleases.length) {
            return res.status(200).json({ message: 'No releases found for this artist' });
        } else {
            return res.status(200).json(allReleases);
        }
    } catch (error) {
        console.error('Error getting artist releases:', error);
        res.status(500).json({
            error: isDev ? error.message : "Something went wrong. Please try again later."
        });
    }
};






const getPopularMix = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Artist ID is required' });

        const artist = await findArtistById(id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        const songs = await Song.find({ artist: id })
            .sort({ playback: -1 })
            .limit(10);

        if (!songs.length) return res.status(404).json({ message: 'No popular songs found for this artist' });
        res.json(songs);
    } catch (error) {
        console.error('Error fetching popular mix:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const getSinglesMix = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Artist ID is required' });

        const artist = await findArtistById(id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        const singles = await Song.find({ artist: id, type: 'single' })
            .sort({ created_at: -1 })
            .limit(10);

        if (!singles.length) return res.status(404).json({ message: 'No singles found for this artist' });
        res.json(singles);
    } catch (error) {
        console.error('Error fetching singles:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const getAlbumsMix = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Artist ID is required' });

        const artist = await findArtistById(id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        const albums = await Album.find({ artist: id })
            .sort({ created_at: -1 })
            .limit(10);

        if (!albums.length) return res.status(404).json({ message: 'No albums found for this artist' });
        res.json(albums);
    } catch (error) {
        console.error('Error fetching albums:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

module.exports = { registerArtist, getPopularSongs, getArtistReleases };