const mongoose = require('mongoose');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { createPassword } = require('../services/global/password');

const { findAlbumById } = require('../services/global/findAlbum');
const { findUserById, findUserByLibrary} = require('../services/global/findUser');
const { findLibraryCollectionById, findLibraryCollectionByUserId } = require('../services/global/findLibraryCol');
const { findAlbumByIdWithSongs } = require('../services/global/findAlbum'); 
const { findSongById } = require('../services/global/findSong');
const { buildUserData, buildUserForeignData, buildArtistData, buildLikedCollection } = require('../utils/responseTemplates');
const { uploadPattern } = require("../utils/pattern/uploadPattern");
const { isDev } = require('../utils/isDev');
const {findArtistByIdNotStrict} = require("../services/global/findArtist");

const getUserMy = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User not authenticated or user ID missing' });
    }
    console.log('Request received for user id:', req.user.id);
    const userId = req.user.id;

    const user = await findUserById(userId);
    const artist = await findArtistByIdNotStrict(userId);
    const library = await findLibraryCollectionById(user.library_collection);

    const userData = buildUserData(user, library.liked.songs.length);
    const artistData = buildArtistData(artist);
    res.status(201).json({
        user: userData,
        artist: artistData
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
};
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    if (!id) return res.status(400).json({ message: 'User ID is required'});

    const user = await findUserById(id);
    const origin_user = await findUserById(user_id);
    const edit_permission = String(user._id) === String(origin_user._id);

    res.status(200).json(buildUserForeignData(user, edit_permission));
  } catch (error) {
    console.log('Server error', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const getLibraryCollectionMy = async (req, res) => {
    try {
        const id = req.user.id;
        const liked_coll = await findLibraryCollectionByUserId(id);

        const liked_songs = [];
        const limit = 25;

        for (const liked_song of liked_coll.songs) {
            if (liked_song.length >= limit) break;
            const song = await Song.findById( liked_song );
            if (!song) {
                return res.status(404).json({ message: 'Song not found'})
            }
            liked_songs.push(song);
        }

        res.status(200).json(buildLikedCollection(liked_coll, liked_songs));
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}
const getLikedCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('LikedC', id)

    const library_collection = await findLibraryCollectionById(id);
    const user = await findUserByLibrary(id);

    const liked_songs = [];
    const limit = 25;

    for (const liked_song of library_collection.liked.songs) {
      if (liked_song.length >= limit) break;
      const song = await findSongById(liked_song._id);
      if (!song) {
        return res.status(404).json({ message: 'Song not found'})
      }
      liked_songs.push(song);
    }
    console.log(user);

    res.status(200).json(buildLikedCollection(library_collection, liked_songs, user.user_name));
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const likeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const library = await findLibraryCollectionById(user.library_collection);
    const songFind = await findSongById(id);

      if (library.liked.songs.some(song_id => song_id.equals(id))) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(400).json({ message: "Song already liked" });
      }

      library.liked.songs.push(id);
    // songFind.likes_count += 1;

    // await songFind.save({ session });
    await library.save({ session });

    await session.commitTransaction();
    await session.endSession();

    res.status(200).json({
      likedSongs: library.liked.songs.length,
        message: 'Song liked successfully',
    })
  } catch (error) {
      if (session.inTransaction()) {
          await session.abortTransaction();
      }
      await session.endSession();

    console.error('Error liking song:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const unLikeSong = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const library = await findLibraryCollectionById(user.library_collection);
    // const songFind = await findSongById(id);

      if (!library.liked.songs.some(song_id => song_id.equals(id))) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(400).json({ message: "Song isn't liked" });
      }

      library.liked.songs.pull(id)
    // songFind.likes_count -= 1;

    await library.save({ session });
    // await songFind.save({ session });

    await session.commitTransaction();
    await session.endSession();

    res.status(200).json({
      likedSongs: library.liked.songs.length,
        message: 'Song unliked successfully',
    })
  } catch (error) {
      if (session.inTransaction()) {
          await session.abortTransaction();
      }
      await session.endSession();

    console.error('Error unliking song:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const likeAlbum = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try{
    const { id } = req.params;
    const userId = req.user.id;

    const user = await findUserById(userId);
    const playlist = await findAlbumById(id);
    const library = await findLibraryCollectionById(user.library_collection);

      if (library.liked.albums.some(album_id => album_id.equals(id))) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(400).json({ message: "Album already liked" });
      }

    library.liked.albums.push(id);
    await library.save({ session });

    await session.commitTransaction();
    await session.endSession();

    res.status(200).json({
      success: true,
      message: 'Playlist/Album has been liked successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    console.error('Error liking album:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}
const unLikeAlbum = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const { id } = req.params;
        const userId = req.user.id;

        const user = await findUserById(userId);
        const playlist = await findAlbumById(id);
        const library = await findLibraryCollectionById(user.library_collection);

        if (!library.liked.albums.some(album_id => album_id.equals(id))) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ message: "Album isn't liked" });
        }

        library.liked.albums.pull(id);
        await library.save({ session });

        await session.commitTransaction();
        await session.endSession();

        res.status(200).json({
            success: true,
            message: 'Playlist/Album has been liked successfully',
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();

        console.error('Error liking album:', error);
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log('change', req.body);

    const user_id = req.user.id;
    const user = await findUserById( user_id );
    user.password_hash = await createPassword(password);
    
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
    const { user_name } = req.body;
    const user_id = req.user.id;

    const user = await findUserById( user_id );
    user.user_name = user_name;

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
  getLikedCollectionById,

  likeSong,
  unLikeSong,
  likeAlbum,
    unLikeAlbum,

  changeEmail,
  changePassword,
  changeUserName,
  changeAvatar
}