const User = require('../models/user.model');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model')
const Album = require('../models/album.model')
const Ref = require('../models/ref.model');
const LibraryCollection = require('../models/libraryCollection.model')
const mongoose = require('mongoose');

const { buildUserData, buildArtistData, buildUserForeignData, buildLikedCollection } = require('../utils/responseTemplates')

const { findUserById } = require('../services/global/findUser');
const { findArtistById } = require('../services/global/findArtist');
const { findLikedColById } = require('../services/global/findLibraryCol');
const { findSongById } = require('../services/global/findSong');
const { findAlbumByIdWithSongs, findAlbumById } = require('../services/global/findAlbum');
const { findArtistByIdNotStrict } = require('../services/global/findArtist');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production';

const getLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    const first20libraryItems = user.library ? user.library.slice(0, 20) : [];
    const libraryItems = [];
    for (const itemId of first20libraryItems) {
      try {
        const album = await findAlbumByIdWithSongs(itemId);
        if (album) {
          libraryItems.push(album);
        }
      } catch (error) {
        console.error(`Error finding album with ID ${itemId}:`, error);
      }
    }

    res.status(200).json({
      libraryItems
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
} 
const getAlbumData = async (req, res) => {
  try {
    const result = await Album.find().sort({ created_at: -1 }).populate('songs');
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const getSongData = async (req, res) => {
  try {
    const result = await Song.find({ type: { $ne: "Album" } }).sort({ created_at: -1 }).populate('features');
    res.status(200).json(result);
  } catch (error) {
    console.log('Server error', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Album ID is required'});

    const album = await Album.findById(id).populate('songs');
    if (!album) return res.status(400).json({ message: "Album is not exists"})
    
    res.status(200).json(album);
  } catch (error) {
    console.log('Server error', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}


module.exports = { 
  getAlbumData, 
  getLibrary,
  getSongData,

  getAlbumById,
};