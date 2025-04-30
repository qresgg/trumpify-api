const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { SECRETKEY_ACCESS, SECRETKEY_REFRESH, NODE_ENV } = process.env;

const Album = require('../../models/Artist/AlbumModel');
const User = require('../../models/User/UserModel');
const LikedCol = require('../../models/User/LikedCollectionModel')
const { findUserByEmail, findUserByEmailExists } = require("../../services/global/findUser")
const { createPassword, verifyPassword } = require("../../services/global/password")
const { createUser, createLikedCollection } = require("../../services/user/createUser")

const { generateAccessToken, generateRefreshToken } = require('../../middleware/token')

const register = async (req, res) => {
  try {
    const { username, email, password} = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await findUserByEmailExists(email);
    const hashedPassword = await createPassword(password);

    const newUser = await createUser( username, email, hashedPassword);  

    await createLikedCollection( newUser );

    res.status(201).json({ message: 'user registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error.message, error.stack);
    res.status(500).json({ message: 'an error occurred', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    await verifyPassword(password, user.password_hash);
    
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    user.refresh_token = refresh_token;
    await user.save();

    res.cookie('refreshToken', refresh_token, { 
      httpOnly: true, 
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    req.session.userId = user._id;
    req.session.userName = user.user_name;
    
    res.json({ access_token })
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'an error occurred' });
  }
}

const logout = async (req, res) => {
  try{
    return res
    .clearCookie("refreshToken")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
  } catch (error) {
    return res.status(500).json({ error: 'internal server error'})
  }
}

const token = async (req, res) => {
  try{
    const refresh_token = req.cookies.refreshToken;
  if (!refresh_token) {
    return res.status(401).send('no refresh token');
  }
  const decoded = jwt.decode(refresh_token);
  if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
    return res.status(403).send('Expired refresh token');
  }
  
  const user = await User.findOne({ refresh_token });
  if(!user) {
    return res.status(403).send('invalid refresh token')
  }

  jwt.verify(refresh_token, SECRETKEY_REFRESH, (err, decoded) => {
    if (err) {
      return res.status(403).send('invalid refresh token');
    }
    const access_token = generateAccessToken(user);
    res.json({access_token})
  })
  } catch (error) {
    return res.status(500).json({ error: 'internal server error'})
  }
}

const verifyToken = async (req, res) => {
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
      decodedToken = jwt.verify(token, SECRETKEY_ACCESS);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken; 
        if (!refreshToken) {
          return res.status(403).json({ message: 'Refresh token is missing' });
        }
        try {
          const decodedRefreshToken = jwt.verify(refreshToken, SECRETKEY_REFRESH);

          const user = await User.findById(decodedRefreshToken._id)
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          const new_access_token = generateAccessToken(user);
          res.setHeader('Authorization', `Bearer ${new_access_token}`);
          req.headers.authorization = `Bearer ${new_access_token}`;
          return next();
        } catch (refreshError) {
          return res.status(403).json({ message: 'Invalid refresh token' });
        }
      }
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }

    const userId = decodedToken.id;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'verified'})
  } catch (error) {
    console.error('Error authenticating token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { register, login, logout, token, verifyToken}