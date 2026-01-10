const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { SECRETKEY_ACCESS, SECRETKEY_REFRESH, NODE_ENV } = process.env;

const Album = require('../../models/album.model');
const User = require('../../models/user.model');
const LikedCol = require('../../models/libraryCollection.model')
const { findUserByEmail, findUserByEmailExists } = require("../../services/global/findUser")
const { createPassword, verifyPassword } = require("../../services/global/password")
const { createUser, createLikedCollection } = require("../../services/create/createUser")

const { generateAccessToken, generateRefreshToken } = require('../../middleware/token')
require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production'

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

    res.status(200).json({ message: 'Sign up has been successfull' });
  } catch (error) {
    console.error('Error during registration:', error.message, error.stack);
    res.status(500).json({ message: 'an error occurred', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    await verifyPassword(password, user.password_hash, res);
    
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    user.refresh_token = refresh_token;
    await user.save();

    res.cookie('refreshToken', refresh_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    req.session.userId = user._id;
    req.session.userName = user.user_name;
    
    res.status(200).json({ message: 'Login has been successfull', access_token: access_token })
  } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: isDev ? error.message : "Something went wrong. Please try again later." });
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
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRETKEY_REFRESH);
    const user = await User.findOne({ 
      _id: decoded.id, 
      refresh_token: refreshToken 
    });

    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const access_token = generateAccessToken(user);
    return res.json({ access_token });

  } catch (err) {
    res.clearCookie('refreshToken');
    return res.status(403).json({ 
      message: err.name === 'TokenExpiredError' 
        ? 'Refresh token expired' 
        : 'Invalid refresh token'
    });
  }
};

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
    
    try {
      const decodedToken = jwt.verify(token, SECRETKEY_ACCESS);
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ message: 'verified' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { register, login, logout, token, verifyToken}