const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const bcrypt = require('bcrypt')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { connectDB } = require('./database/mongodb')

const authRoutes = require('./routes/authRoutes');

// const TokenSchema = require('./models/Token')

require('dotenv').config();

const PORT = process.env.PORT || 4000;
const SECRETKEY = process.env.SECRETKEY;
const app = express();

connectDB()

app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(session({
  secret: SECRETKEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true, 
    sameSite: 'strict',
  },
}));

app.use(express.json());

app.use('/auth', authRoutes);

const start = (port) => {
  try {
    app.listen(port, () => {
      console.log(`server is working on ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit()
  }
}

start(PORT);