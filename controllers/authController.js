const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Album = require('../models/AlbumModel');
const User = require('../models/UserModel');
//const Token = require('./models/TokenModel')
const { SECRETKEY, NODE_ENV} = process.env;

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
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      user_name: userName,
      email: email,
      password_hash: hashedPassword,
      created_at: Date.now()
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, userName: newUser.user_name, role: newUser.role },
      SECRETKEY, {expiresIn: '15m'}
    );

    newUser.access_token = token;
    await newUser.save();

    res.cookie('access_token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 10000
        });

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ user_name: userName });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    } 
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    user.access_token = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, userName: user.user_name, role: user.role },
      SECRETKEY, {expiresIn: '15m'}
    );
    user.access_token = token;
    await user.save();

    res.cookie('access_token', token, { 
      httpOnly: true, 
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000
      });

    req.session.userId = user._id;
    req.session.userName = user.user_name;

    //await Token.create({ userId: user._id, userName: user.user_name, token });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
}

module.exports = { data, register, login }