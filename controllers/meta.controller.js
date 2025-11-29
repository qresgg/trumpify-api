const Ref = require('../models/ref.model');
const { findArtistById } = require('../services/global/findArtist');
const { findUserById } = require('../services/global/findUser');

const getRegions = async (req, res) => {
  try {
    const regions = await Ref.find({}, 'regions');
    if (!regions || regions.length === 0) {
      return res.status(404).json({ message: 'No regions found' });
    }
    res.status(200).json(regions[0].regions);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const getGenres = async (req, res) => {
  try {
    const genres = await Ref.find({}, 'genres');
    if (!genres || genres.length === 0) {
      return res.status(404).json({ message: 'No genres found' });
    }
    res.status(200).json(genres[0].genres);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
}

const updateRegionArtist = async (req, res) => {
  try { 
    const { region } = req.body;

    const userId = req.user.id;
    const user = findUserById(userId);
    const artist = findArtistById(user.artist_profile);

    artist.region = region;
    await artist.save();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
} 

module.exports = {
    getGenres,
    getRegions,

    updateRegionArtist
}