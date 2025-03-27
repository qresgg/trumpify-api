const User = require('../models/UserModel');
const Artist = require('../models/ArtistModel');
const Song = require('../models/SongModel')
const Album = require('../models/AlbumModel')

const findArtistById = async (req, res) => {
  const { id } = req.params;

  try{
    const artist = await Artist.findById( id );
    if (!artist) {
      res.status(404).json({ message: 'Artist is not found' });
    }

    res.json({
      artist_avatar: artist.artist_avatar,
      artist_listeners: artist.artist_listeners,
      artist_subscribers: artist.artist_subscribers,
      artist_name: artist.name,
      artist_bio: artist.bio,
      artist_is_verified: artist.is_verified,
      artist_albums: artist.songs,
      artist_songs: artist.albums
    });
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
}

const findUserById = async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById( id ); 
    if(!user) {
      res.status(404).json({ message: 'User is not found'});
    }
    res.json({
      user_name: user.user_name,
      user_avatar: user.url_avatar,
      user_playlists: user.playlists,
    })
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { findArtistById, findUserById }