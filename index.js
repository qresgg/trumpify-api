const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const { connectDB } = require('./database/mongodb')

const authRoutes = require('./routes/auth/authRoutes');
const apiRoutes = require('./routes/api/userRoutes');
const artistRoutes = require('./routes/artist/artistRoutes');
const settingsRoutes = require('./routes/user/settingsRoutes');
const actionRoutes = require('./routes/user/userActionsRoutes');
const findRoutes = require('./routes/find/findRoutes');

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
app.use('/api', apiRoutes);
app.use('/artist', artistRoutes);
app.use('/settings', settingsRoutes);
app.use('/actions', actionRoutes);
app.use('/find', findRoutes);

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