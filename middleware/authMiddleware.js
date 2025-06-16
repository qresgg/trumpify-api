const User = require('../models/User/UserModel');
const { generateAccessToken, generateRefreshToken, decodeAccessToken, decodeRefreshToken} = require('../middleware/token');
const findUserById = require('../services/global/findUser')

require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Перевірка наявності заголовка
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    // Перевірка формату токена
    const tokenParts = authHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
      return res.status(400).json({ message: 'Authorization format is invalid' });
    }

    const token = tokenParts[1];

    try {
      // Спроба валідації access token
      const decodedToken = decodeAccessToken(token);
      const user = await User.findById(decodedToken.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = { id: user._id };
      return next();
      
    } catch (error) {
      // Обробка простроченого токена
      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
          return res.status(401).json({ message: 'Refresh token is missing' }); // Змінимо на 401
        }

        try {
          // Валідація refresh token
          const decodedRefreshToken = decodeRefreshToken(refreshToken);
          const user = await User.findById(decodedRefreshToken.id);
          
          if (!user || user.refresh_token !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
          }

          // Генерація нового токена
          const newAccessToken = generateAccessToken(user);
          
          // Встановлюємо новий токен у заголовки
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

