const User = require('../../models/User/UserModel');
const Artist = require('../../models/Artist/ArtistModel');
const Song = require('../../models/Artist/SongModel')
const Album = require('../../models/Artist/AlbumModel')
const LikedCol = require('../../models/User/LikedCollectionModel')
const mongoose = require('mongoose');

const { buildUserData, buildArtistData, buildUserForeignData } = require('../../utils/responseTemplates')

const { findUserById } = require('../../services/global/findUser');
const { findArtistById } = require('../../services/global/findArtist');
const { findLikedColById } = require('../../services/global/findLikedCol');
const { findSongById } = require('../../services/global/findSong');
const { findAlbumByIdWithSongs, findAlbumById } = require('../../services/global/findAlbum');
const { findArtistByIdNotStrict } = require('../../services/global/findArtist');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const getUserData = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User not authenticated or user ID missing' });
    }
    console.log('Request received for user id:', req.user.id);
    const userId = req.user.id;

    const user = await findUserById(userId);
    const artist = await Artist.findById(user.artist_profile);
    
    const likedCol = await findLikedColById(user.liked_collection);
    
    const first20LikedSongs = likedCol ? likedCol.songs.slice(0, 20) : [];
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
    const userData = buildUserData(user, likedCol, first20LikedSongs, libraryItems);
    const artistData = buildArtistData(artist);
    res.json({
      user: userData,
      artist: artistData
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
};

const search = async (req, res) => {
  const { query } = req.query;
  
  try{
    const artistResults = await Artist.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }
      ]
    });
    const songResults = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } }
      ]
    });
    const albumResults = await Album.find({
      $or: [
        { title: { $regex: query, $options: 'i'}}
      ]
    }).populate('songs');
    const userResults = await User.find({
      $or: [
        { user_name: { $regex: query, $options: 'i' } }
      ]
    });
    const allResults = [
      ...artistResults.map((result) => (buildArtistData(result))),
      ...songResults.map((result) => ({ type: 'Song', ...result.toObject()})),
      ...albumResults.map((result) => ({ type: 'Album', ...result.toObject()})),
      ...userResults.map((result) => (buildUserData(result)))
    ];

    if (!query) {
      return res.json([...artistResults, ...songResults, ...albumResults, ...userResults]);
    }

    console.log(allResults)
    res.json(allResults);
  } catch (error) {
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}


const likeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { song } = req.body;

    const songId = song._id;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const likedCol = await findLikedColById(user.liked_collection);
    const songFind = await findSongById(songId);

    likedCol.songs.push(songId)
    songFind.likes_count += 1;
    
    await songFind.save({ session });
    await likedCol.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({
      likedSongs: likedCol.songs.length
    })
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const unLikeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { song } = req.body;

    const songId = song._id;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const likedCol = await findLikedColById(user.liked_collection);
    const songFind = await findSongById(songId);
    
    likedCol.songs.pull(songFind)
    songFind.likes_count -= 1;
    await likedCol.save({ session });
    await songFind.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({
      likedSongs: likedCol.songs.length
    })
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const getLikedCollection = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await findUserById(userId);
    const likedColl = await findLikedColById(user.liked_collection);

    const likedSongs = [];
    const limit = 25;

    for (const likedSong of likedColl.songs) {
      if (likedSong.length >= limit) break;
      const song = await Song.findById( likedSong );
      if (!song) {
        return res.status(404).json({ message: 'Song not found'})
      }
      likedSongs.push(song);
    }

    res.json({
      _id: likedColl._id,
      title: 'Liked Songs',
      user_id: likedColl._id,
      privacy_type: likedColl.privacy_type,
      songs: likedSongs
    })
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

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
    if (!album) return res.tatus(400).json({ message: "Album is not exists"})
    
    res.status(200).json(album);
  } catch (error) {
    console.log('Server error', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id.toString();

    if (!id) return res.status(400).json({ message: 'User ID is required'});

    const user = await findUserById(id);
    
    res.status(200).json(id === userId ? buildUserData(user) : buildUserForeignData(user));
  } catch (error) {
    console.log('Server error', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

module.exports = { 
  getUserData, 
  likeSong, 
  unLikeSong, 
  search, 
  getAlbumData, 
  getLikedCollection, 
  getLibrary,
  getSongData,

  getAlbumById,
  getUserById
};