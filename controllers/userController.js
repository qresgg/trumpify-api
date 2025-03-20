const User = require('../models/UserModel');
const Artist = require('../models/ArtistModel');
const Song = require('../models/SongModel')

const getUserData = async (req, res) => {
  try {
    console.log('Request received for user data:', req.user);
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User nsot found' });
    }
    
    const artist = await Artist.findById(user.artist_profile);

    res.json({
      urlAvatar: user.url_avatar,
      userId: user._id,
      userName: user.user_name,
      userEmail: user.email,
      artistName: artist ? artist.name : 'none'
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const likeSong = async (req, res) => {
  try {
    console.log(`Received Song: ${req.song}`);
    const userId = req.user.id;
    const songId = req.song.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song is not found' });
    }
    
    user.liked_songs.push(song)
    await user.save();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const unLikeSong = async (req, res) => {
  try {
    console.log();
    const userId = req.user.id;
    const songId = req.song.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song is not found' });
    }
    
    user.liked_songs.pull(song)
    await user.save();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getUserData, likeSong, unLikeSong};