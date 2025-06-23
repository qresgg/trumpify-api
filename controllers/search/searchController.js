const mongoose = require('mongoose')
const User = require('../../models/User/UserModel');
const Artist = require('../../models/Artist/ArtistModel');
const Song = require('../../models/Artist/SongModel')
const Album = require('../../models/Artist/AlbumModel');
const { findArtistById } = require('../../services/global/findArtist');
const { buildUserData, buildArtistData } = require('../../utils/responseTemplates');
const { findUserById } = require('../../services/global/findUser');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const searchArtistById = async (req, res) => {
  const { id } = req.params;

  try{
    const artist = await findArtistById(id);
    const artistData = buildArtistData(artist);

    res.status(200).json(artistData);
  } catch(error) {
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const searchUserById = async (req, res) => {
  const { id } = req.params

  try {
    const user = await findUserById(id);
    res.json({
      user_name: user.user_name,
      user_avatar_url: user.url_avatar,
      user_playlists: user.playlists,
    })
  } catch(error) {
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const searchAlbumById = async (req, res) => {
  const { id } = req.params

  try {
    const album = await Album.findById(id).populate('songs')
    if (!album) {
      res.status(404).json({ message: 'Album is not found'})
    }
    res.send(album)
  } catch (error) {
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const searchArtistByName = async (req, res) => {
  const { name } = req.query

  try {
    const artist = await Artist.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (!artist) {
      return res.status(404).json({ message: 'Artist is not exists' })
    }

    res.status(200).json({
      artist_avatar: artist.artist_avatar,
      artist_banner: artist.artist_banner,
      artist_listeners: artist.artist_listeners,
      artist_subscribers: artist.artist_subscribers,
      artist_name: artist.name,
      artist_bio: artist.bio,
      artist_is_verified: artist.is_verified,
      artist_albums: artist.albums,
      artist_songs: artist.songs,
      artist_id: artist._id
    })
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

// const findPlaylistById = async (req, res) => {
//   const { id } = req.params
  
//   try {
//     const playlist = await Playlist.findById()
//   } catch (error) {
//     res.status(500).json({ error: err.message })
//   }
// }

module.exports = { searchArtistById, searchUserById, searchAlbumById, searchArtistByName}