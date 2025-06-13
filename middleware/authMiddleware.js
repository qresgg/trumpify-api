const User = require('../models/User/UserModel');
const { generateAccessToken, generateRefreshToken, decodeAccessToken, decodeRefreshToken} = require('../middleware/token');
const findUserById = require('../services/global/findUser')

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
      return res.status(400).json({ message: 'Authorization format is invalid' });
    }

    const token = tokenParts[1];
    let decodedToken;

    try {
      decodedToken = decodeAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken; 
        if (!refreshToken) {
          return res.status(403).json({ message: 'Refresh token is missing' });
        }
        try {
          const decodedRefreshToken = decodeRefreshToken(refreshToken);
          const userId = decodedRefreshToken.id;
          const user = await findUserById(userId)

          const new_access_token = generateAccessToken(user);
          res.setHeader('Authorization', `Bearer ${new_access_token}`);
          req.headers.authorization = `Bearer ${new_access_token}`;
          
          if (!req.user) {
            req.user = {};
          }
          req.user.id = userId;
          
          return next();
        } catch (refreshError) {
          return res.status(403).json({ message: 'Invalid refresh token' });
        }
      }
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }

    const userId = decodedToken.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.user) {
      req.user = {};
    }
    req.user.id = userId;
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
  }
};


module.exports = { authenticateToken }

