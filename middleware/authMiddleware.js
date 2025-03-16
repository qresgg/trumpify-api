const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const { SECRETKEY_ACCESS, SECRETKEY_REFRESH } = process.env;

const decodeToken = (token) => {
  const decoded = jwt.verify(token, SECRETKEY_ACCESS)
  return decoded;
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = decodeToken(token);
    
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }
    const userId = decodedToken.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = { authenticateToken }

