const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const bcrypt = require('bcrypt')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { connectDB } = require('./database/mongodb')

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes')

// const TokenSchema = require('./models/Token')

require('dotenv').config();

const PORT = process.env.PORT || 4000;
const { SECRETKEY_COOKIES, NODE_ENV } = process.env;
const app = express();

connectDB()

app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(session({
  secret: SECRETKEY_COOKIES,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true, 
    sameSite: 'strict',
  },
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', userRoutes);

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