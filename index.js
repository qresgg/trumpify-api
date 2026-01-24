const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const { connectDB } = require('./database/mongodb')

const authRoutes = require('./routes/auth.route');
const apiRoutes = require('./routes/api.route');
const artistRoutes = require('./routes/artist.route');
const settingsRoutes = require('./routes/settings.route');
const userRouter = require('./routes/user.route');

require('dotenv').config();
connectDB();

const PORT = process.env.PORT || 4000;
const { SECRETKEY_COOKIES, NODE_ENV, PROD_CLIENT_URL, DEV_CLIENT_URL, ANDROID_URL, DEV_ALT_URL, DEV_ALT_URL_2 } = process.env;
const app = express();

app.use(cors({
    origin: NODE_ENV === 'production' ? [PROD_CLIENT_URL] : [DEV_ALT_URL, DEV_ALT_URL_2, ANDROID_URL, DEV_CLIENT_URL],
    credentials: true,
}));
app.use(cookieParser())


app.use(session({
  secret: SECRETKEY_COOKIES,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/artist', artistRoutes);
app.use('/settings', settingsRoutes);
app.use('/user', userRouter);

const start = (port) => {
  try {
    app.listen(port,  () => {
      console.log(`server is working on ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit()
  }
}

start(PORT);