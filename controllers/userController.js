const User = require('../models/UserModel');
const getUserData = async (req, res) => {
  try {
    console.log('Request received for user data:', req.user);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.user_name,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { getUserData };