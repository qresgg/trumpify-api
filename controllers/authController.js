const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Album = require('../models/AlbumModel');
const User = require('../models/UserModel');

const { SECRETKEY_ACCESS, SECRETKEY_REFRESH, NODE_ENV} = process.env;

const generateAccessToken = (user) => {
  return jwt.sign({id: user._id, userName: user.user_name}, SECRETKEY_ACCESS, { expiresIn: '15m'})
}
const generateRefreshToken = (user) => {
  return jwt.sign({id: user._id, userName: user.user_name}, SECRETKEY_REFRESH, { expiresIn: '7d' })
}

const data = async (req, res) => {
  try {
        const result = await Album.find().populate('songs');
        
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
}
const register = async (req, res) => {
  try {
    const { userName, email, password} = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userNameExists = await User.findOne({ user_name: userName });
    const emailExists = await User.findOne({ email: email });

    if (userNameExists) {
      return res.status(400).json({ message: 'username already exists' });
    }

    if (emailExists) {
      return res.status(400).json({ message: 'email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      user_name: userName,
      email: email,
      password_hash: hashedPassword,
      created_at: Date.now()
    });

    await newUser.save();
    res.status(201).json({ message: 'user registered successfully' });

  } catch (error) {
    console.error('Error during registration:', error.message, error.stack);
  res.status(500).json({ message: 'an error occurred', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ user_name: userName });

    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    } 
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'incorrect password' });
    }
    
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    user.refresh_token = refresh_token;
    await user.save();

    res.cookie('refreshToken', refresh_token, { 
      httpOnly: true, 
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    req.session.userId = userName._id;
    req.session.userName = userName.user_name;
    
    res.json({access_token})
    
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

const verifyToken = (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRETKEY_ACCESS, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(200).json({ message: 'Token is valid' });
  });
}


module.exports = { data, register, login, logout, token, verifyToken}