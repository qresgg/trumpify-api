const mongoose = require('mongoose');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const bcrypt = require('bcrypt');
const { createPassword } = require('../services/global/password');

const { findAlbumById } = require('../services/global/findAlbum');
const { findUserById } = require('../services/global/findUser');
const { findLikedColById, findLikedColByUserId } = require('../services/global/findLikedCol');
const { findAlbumByIdWithSongs } = require('../services/global/findAlbum'); 
const { findSongById } = require('../services/global/findSong');
const { buildUserData, buildUserForeignData, buildArtistData, buildLikedCollection } = require('../utils/responseTemplates');
const { uploadPattern } = require("../utils/pattern/uploadPattern");
const { isDev } = require('../utils/isDev');

const getUserMy = async (req, res) => {
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
const getLikedCollectionMy = async (req, res) => {
  try {
    const id = req.user.id;
    const likedColl = await findLikedColByUserId(id);

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

    res.status(200).json(buildLikedCollection(likedColl, likedSongs));
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!id) return res.status(400).json({ message: 'User ID is required'});

    const user = await findUserById(id);
    const originUser = await findUserById(userId);
    const editPermission = String(user._id) === String(originUser._id);

    res.status(200).json(buildUserForeignData(user, editPermission));
  } catch (error) {
    console.log('Server error', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const getLikedCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)

    const likedColl = await findLikedColById(id);

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

    res.status(200).json(buildLikedCollection(likedColl, likedSongs));
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const handleLikeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const likedCol = await findLikedColById(user.liked_collection);
    const songFind = await findSongById(id);

    likedCol.songs.push(id);
    songFind.likes_count += 1;
    
    await songFind.save({ session });
    await likedCol.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      likedSongs: likedCol.songs.length
    })
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error liking song:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const handleUnLikeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const likedCol = await findLikedColById(user.liked_collection);
    const songFind = await findSongById(id);
    
    likedCol.songs.pull(songFind)
    songFind.likes_count -= 1;

    await likedCol.save({ session });
    await songFind.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      likedSongs: likedCol.songs.length
    })
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error unliking song:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const handleLikeAlbum = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try{
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const playlist = await findAlbumById(id);

    if(!user.library.includes(playlist._id)){
      user.library.push(playlist._id);
    }
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Playlist/Album has been liked successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error liking album:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const handleUnLikeAlbum = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction();

  try{ 
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const playlist = await findAlbumById(id);

    user.library.pull(playlist._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Playlist/Album has been liked successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error unliking album:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log('change', req.body);

    const userId = req.user.id;
    const user = await findUserById( userId ); 
    const hashedPassword = await createPassword(password); 
    user.password_hash = hashedPassword;
    
    await user.save();

    res.status(200).json({ message: 'Password has been successfully updated' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
};
const changeEmail = async (req, res) => {
  try {
    const { email, newEmail } = req.body;
    
    const userId = req.user.id;
    const user = await findUserById( userId );
    if (email !== user.email) {
      return res.status(400).json({ message: 'Emails do not match' });
    }
    user.email = newEmail;

    await user.save();

    res.status(200).json({ message: 'Email has been successfully updated' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const changeUserName = async (req, res) => {
  try {
    const { userName } = req.body;
    const userId = req.user.id;

    const user = await findUserById( userId );
    user.user_name = userName;

    await user.save();

    res.status(200).json({ 
      message: 'Username has been successfully changed' 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const changeAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.file);
    const avatarUrl = await uploadPattern({ file: req.file, userId });
    res.status(200).json({
      message: "Avatar has been successfully updated",
      avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
};
module.exports = {
  getUserMy,
  getUserById,
  getLikedCollectionMy,
  getLikedCollectionById,
  
  handleLikeSong,
  handleUnLikeSong,
  handleLikeAlbum,
  handleUnLikeAlbum,

  changeEmail,
  changePassword,
  changeUserName,
  changeAvatar
}