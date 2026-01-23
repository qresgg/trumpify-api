require('dotenv').config();
const isDev = process.env.NODE_ENV !== 'production';

module.exports = { isDev };