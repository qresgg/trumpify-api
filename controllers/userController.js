const User = require('../models/UserModel');
const Artist = require('../models/ArtistModel');
const Song = require('../models/SongModel')
const Album = require('../models/AlbumModel')

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
      user: {
        user_avatar_url: user.url_avatar,
        user_id: user._id,
        user_name: user.user_name,
        user_email: user.email,
      },
      artist: artist ? {
        artist_id: artist._id,
        artist_name: artist.name ,
      } : 'none'
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const search = async (req, res) => {
  const { query } = req.query;
  console.log(query)
  
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
    });
    console.log(`${artistResults}, ${songResults}, ${albumResults}`)
    const allResults = [
      ...artistResults.map((result) => ({ type: 'Artist', ...result.toObject()})),
      ...songResults.map((result) => ({ type: 'Song', ...result.toObject()})),
      ...albumResults.map((result) => ({ type: 'Album', ...result.toObject()}))
    ];

    if (!query) {
      return res.json([...artistResults, ...songResults, ...albumResults]);
    }


    res.json(allResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const likeSong = async (req, res) => {
  try {
    const { song } = req.body;
    console.log(song)

    const songId = song._id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }
    if (user.liked_songs.includes(songId)) {
      return res.status(400).json({ message: 'Song is already liked' });
    }
    const songFind = await Song.findById(songId);
    if (!songFind) {
      return res.status(404).json({ message: 'Song is not found' });
    }

    user.liked_songs.push(songId)
    songFind.likesCount += 1;
    
    await songFind.save();
    await user.save();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const unLikeSong = async (req, res) => {
  try {
    const { song } = req.body;

    const songId = song._id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }
    const songFind = await Song.findById(songId);
    if (!Song) {
      return res.status(404).json({ message: 'Song is not found' });
    }
    
    user.liked_songs.pull(songFind)
    await user.save();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}



module.exports = { getUserData, likeSong, unLikeSong, search};