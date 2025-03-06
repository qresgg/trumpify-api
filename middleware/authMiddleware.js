const jwt = require('jsonwebtoken');
const { SECRETKEY_ACCESS } = process.env;

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, SECRETKEY_ACCESS, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken }