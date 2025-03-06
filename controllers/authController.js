const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Album = require('../models/AlbumModel');
const User = require('../models/UserModel');
//const Token = require('./models/TokenModel')
const { SECRETKEY_ACCESS, SECRETKEY_REFRESH, NODE_ENV} = process.env;

const generateAccessToken = (user) => {
  return jwt.sign({id: user._id, userName: user.user_name, userRole: user.role}, SECRETKEY_ACCESS, { expiresIn: '15m'})
}
const generateRefreshToken = (user) => {
  return jwt.sign({id: user._id, userName: user.user_name, userRole: user.role}, SECRETKEY_REFRESH, { expiresIn: '7d' })
}

const data = async (req, res) => {
  try {
        const result = await Album.find();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
}
const register = async (req, res) => {
  try {
    const { userName, email, password} = req.body;

    const userExists = await User.findOne({ userName, email });
    if (userExists) {
      return res.status(400).json({ message: 'user already exists' });
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
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'an error occurred' });
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
    //await Token.create({ userId: user._id, userName: user.user_name, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'an error occurred' });
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



module.exports = { data, register, login, token}