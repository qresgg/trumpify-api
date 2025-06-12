const mongoose = require('mongoose')
const User = require('../../models/User/UserModel');
const Artist = require('../../models/Artist/ArtistModel');
const Song = require('../../models/Artist/SongModel')
const Album = require('../../models/Artist/AlbumModel');

const searchArtistById = async (req, res) => {
  const { id } = req.params;

  try{
    const artist = await Artist.findById( id );
    if (!artist) {
      return res.status(404).json({ message: 'Artist is not found' });
    }

    res.json({
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
    });
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
}

const searchUserById = async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById( id ); 
    if(!user) {
      res.status(404).json({ message: 'User is not found'});
    }
    res.json({
      user_name: user.user_name,
      user_avatar_url: user.url_avatar,
      user_playlists: user.playlists,
    })
  } catch(err) {
    res.status(500).json({ error: err.message })
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
    res.status(500).json({ error: err.message })
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
    res.status(500).json({ error: error.message || 'Unknown server error' });
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