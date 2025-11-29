const User = require('../models/user.model');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model')
const Album = require('../models/album.model')
const Ref = require('../models/ref.model');
const { buildUserData, buildArtistData, buildUserForeignData, buildLikedCollection } = require('../utils/responseTemplates');
const { isDev } = require('../utils/isDev');

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

module.exports = {
    search
}