const User = require('../../models/User/UserModel');
const Artist = require('../../models/Artist/ArtistModel');
const Song = require('../../models/Artist/SongModel')
const Album = require('../../models/Artist/AlbumModel')
const LikedCol = require('../../models/User/LikedCollectionModel')
const mongoose = require('mongoose')

const getUserData = async (req, res) => {
  try {
    console.log('Request received for user id:', req.user);
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const artist = await Artist.findById(user.artist_profile);

    const likedCol = await LikedCol.findById( user.liked_collection );
    if (!likedCol) {
      return res.status(404).json({ message: 'LikedCol not found'})
    }
    
    const first20LikedSongs = likedCol ? likedCol.songs.slice(0, 20) : [];

    res.json({
      user: {
        user_avatar_url: user.url_avatar,
        user_id: user._id,
        user_name: user.user_name,
        user_email: user.email,
        user_likedSongsCount: likedCol.songs.length,
        user_likedSongsList: first20LikedSongs
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

const getAlbumData = async (req, res) => {
  try {
    const result = await Album.find().populate('songs');
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
}

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
    });
    const userResults = await User.find({
      $or: [
        { user_name: { $regex: query, $options: 'i' } }
      ]
    });
    console.log(`${artistResults}, ${songResults}, ${albumResults}, ${userResults}`)
    const allResults = [
      ...artistResults.map((result) => ({ type: 'Artist', ...result.toObject()})),
      ...songResults.map((result) => ({ type: 'Song', ...result.toObject()})),
      ...albumResults.map((result) => ({ type: 'Album', ...result.toObject()})),
      ...userResults.map((result) => ({ type: 'User', ...result.toObject()}))
    ];

    if (!query) {
      return res.json([...artistResults, ...songResults, ...albumResults, ...userResults]);
    }


    res.json(allResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const likeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { song } = req.body;

    const songId = song._id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }
    const likedCol = await LikedCol.findById(user.liked_collection);
    if (!likedCol) {
      return res.status(404).json({ message: 'Liked Collection not exists'})
    }
    if (likedCol.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song is already liked' });
    }
    const songFind = await Song.findById(songId);
    if (!songFind) {
      return res.status(404).json({ message: 'Song is not found' });
    }

    likedCol.songs.push(songId)
    songFind.likesCount += 1;
    
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
    res.status(500).json({ message: 'Server error' });
  }
}

const unLikeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { song } = req.body;

    const songId = song._id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }
    const likedCol = await LikedCol.findById(user.liked_collection);
    if (!likedCol) {
      return res.status(404).json({ message: 'Liked Collection is not found'})
    }
    const songFind = await Song.findById(songId);
    if (!Song) {
      return res.status(404).json({ message: 'Song is not found' });
    }
    
    likedCol.songs.pull(songFind)
    songFind.likesCount -= 1;
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
    res.status(500).json({ message: 'Server error' });
  }
}

const getLikedCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById( userId );
    if (!user) {
      return res.status(404).json({ message: 'User not found'})
    }
    const likedColl = await LikedCol.findById( user.liked_collection );
    if (!likedColl) {
      return res.status(404).json({ message: 'Liked collection not found' })
    }

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
    console.error( error );
  }
}


module.exports = { getUserData, likeSong, unLikeSong, search, getAlbumData, getLikedCollection};