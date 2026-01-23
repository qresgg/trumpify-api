const Song = require('../models/song.model')
const Album = require('../models/album.model')

const { findUserById } = require('../services/search.main');
const { likedAlbums } = require("../services/useful.fragment.js");
const { userAuthCheck } = require("../services/useful.fragment");

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production';

const getLibrary = async (req, res) => {
  try {
      await userAuthCheck(req.user, res);

      const userId = req.user.id;
      const libraryItems = await likedAlbums(userId);

      res.status(200).json(libraryItems);
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
    await userAuthCheck(req.user, res);
    if (!id) return res.status(400).json({ message: 'Album ID is required'});

    const album = await Album.findById(id).populate('songs').lean();;
    if (!album) return res.status(400).json({ message: "Album is not exists"});
    const user = await findUserById(userId);
    const library = await findLibraryCollectionById(user.library_collection);

      for(const song of album?.songs){
          if (library.liked.songs.some(songId => songId.equals(song._id))){
              song.is_liked = true;
          }
      }

      if(library.liked.albums.some(album_id => album_id.equals(album._id))){
          album.is_liked = true;
      }
    
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