const jwt = require('jsonwebtoken');
const { SECRETKEY_ACCESS, SECRETKEY_REFRESH } = process.env;

const generateAccessToken = (user) => {
    return jwt.sign({id: user._id, userName: user.user_name}, SECRETKEY_ACCESS, { expiresIn: '60m'})
}
const generateRefreshToken = (user) => {
    return jwt.sign({id: user._id, userName: user.user_name}, SECRETKEY_REFRESH, { expiresIn: '7d' })
}
const decodeAccessToken = (token) => {
    const decoded = jwt.verify(token, SECRETKEY_ACCESS)
    return decoded;
};
const decodeRefreshToken = (token) => {
    const decoded = jwt.verify(token, SECRETKEY_REFRESH)
    return decoded;
}
module.exports = { generateAccessToken, generateRefreshToken, decodeAccessToken, decodeRefreshToken };