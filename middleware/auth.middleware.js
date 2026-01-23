const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, decodeAccessToken, decodeRefreshToken} = require('./token');
const findUserById = require('../services/search.main')

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

    try {
      const decodedToken = decodeAccessToken(token);
      const user = await User.findById(decodedToken.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = { id: user._id };
      return next();
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
          return res.status(401).json({ message: 'Refresh token is missing' });
        }

        try {
          const decodedRefreshToken = decodeRefreshToken(refreshToken);
          const user = await User.findById(decodedRefreshToken.id);
          
          if (!user || user.refresh_token !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
          }

          const newAccessToken = generateAccessToken(user);
          
          res.set('New-Access-Token', newAccessToken);
          req.headers.authorization = `Bearer ${newAccessToken}`;
          req.user = { id: user._id };
          
          return next();
          
        } catch (refreshError) {
          return res.status(403).json({ message: 'Invalid refresh token' });
        }
      }
      
      return res.status(401).json({ message: 'Invalid token' });
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: isDev ? error.message : 'Internal server error' 
    });
  }
};


module.exports = { authenticateToken }

