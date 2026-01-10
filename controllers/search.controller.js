const User = require('../models/user.model');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model')
const Album = require('../models/album.model')
const Ref = require('../models/ref.model');
const { buildUserData, buildArtistData, buildUserForeignData, buildLikedCollection } = require('../utils/responseTemplates');
const { isDev } = require('../utils/isDev');
const {findUserById} = require("../services/global/findUser");
const {findLibraryCollectionById} = require("../services/global/findLibraryCol");

const search = async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ message: "Search term is required." });
  }

  const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const searchTerm = new RegExp(escapeRegex(id), 'i');

  try {
    const queries = [
      {
        model: Artist,
        field: 'name',
        select: '_id name definition artist_avatar',
        formatter: buildArtistData
      },
      {
        model: Song,
        field: 'title',
        select: '_id title definition song_cover'
      },
      {
        model: Album,
        field: 'title',
        select: '_id title definition cover'
      },
      {
        model: User,
        field: 'user_name',
        select: '_id user_name definition url_avatar',
        formatter: buildUserForeignData
      }
    ];

    const results = await Promise.all(
      queries.map(({ model, field, select }) =>
        model.find({ [field]: searchTerm }).select(select)
      )
    );

    const allResults = results.flatMap((result, index) => {
      const formatter = queries[index].formatter;
      return formatter
        ? result.map((r) => formatter(r))
        : result.map((r) => r.toObject());
    });

    const limitedResults = allResults.slice(0, 10);

    res.status(200).json(limitedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
};

const searchAlbumById = async (req, res) => {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
        return res.status(400).json({ message: 'User not authenticated or user ID missing' });
    }
    const userId = req.user.id;

    try {
        const album = await Album.findById(id).populate('songs');
        if (!album) {
            res.status(404).json({ message: 'Album is not found'})
        }
        const user = await findUserById(userId);
        const libraryCollection = await findLibraryCollectionById(user.library_collection);

        const likedSongIds = new Set(
            libraryCollection.liked.songs.map(songId => songId.toString())
        );
        const songsWithLike = album.songs.map(song => ({
            ...song.toObject(),
            is_liked: likedSongIds.has(song._id.toString()),
        }));

        res.status(200).json({
            ...album.toObject(),
            songs: songsWithLike,
        })
    } catch (error) {
        res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
    }
}

module.exports = {
    search,
    searchAlbumById
}