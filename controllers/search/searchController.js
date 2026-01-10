const mongoose = require('mongoose')
const User = require('../../models/user.model');
const Artist = require('../../models/artist.model');
const Song = require('../../models/song.model')
const Album = require('../../models/album.model');
const { findArtistById } = require('../../services/global/findArtist');
const { buildUserData, buildArtistForeignData } = require('../../utils/responseTemplates');
const { findUserById } = require('../../services/global/findUser');

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const searchArtistById = async (req, res) => {
  const { id } = req.params;

  try{
    const artist = await findArtistById(id);
    const artistData = buildArtistForeignData(artist);

    res.status(200).json(artistData);
  } catch(error) {
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const searchUserById = async (req, res) => {
  const { id } = req.params

  try {
    const user = await findUserById(id);
    res.status(200).json({
      user_name: user.user_name,
      user_avatar_url: user.url_avatar,
      user_playlists: user.playlists,
    })
  } catch(error) {
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
      _id: artist._id,
      artist_avatar: artist.artist_avatar,
      artist_banner: artist.artist_banner,
      artist_listeners: artist.artist_listeners,
      artist_subscribers: artist.artist_subscribers,
      artist_name: artist.name,
      artist_bio: artist.bio,
      artist_is_verified: artist.is_verified,
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

module.exports = { searchArtistById, searchUserById, searchArtistByName}