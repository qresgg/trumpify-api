const User = require('../models/UserModel');
const Artist = require('../models/ArtistModel');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');



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
      userName: user.user_name,
      userEmail: user.email,
      artistName: artist ? artist.name : 'none'
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { getUserData };