
const { isDev } = require('../utils/isDev');
const {findUserByEmailExists, findUserByEmail, findUserById} = require("../services/global/findUser");
const {createLibraryCollection, createUser} = require("../services/create/createUser");
const {verifyPassword, createPassword} = require("../services/global/password");
const {generateAccessToken, generateRefreshToken} = require("../middleware/token");
const {RT_pattern} = require("../utils/pattern/token.pattern");
const jwt = require('jsonwebtoken');
const {User} = require("../models/user.model");
const mongoose = require("mongoose");

const register = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const { username, email, password } = req.body;
        if (!username || !email || !password || !password.length) {
            return res.status(400).json({ message: "All fields are required" });
        }
        await findUserByEmailExists(email);
        const hashedPassword = await createPassword(password);
        const newUser = await createUser(username, email, hashedPassword, session);
        await createLibraryCollection(newUser, session);

        await session.commitTransaction();
        await session.endSession();
        res.status(200).json({ message: "Sing up has been successfully" });
    } catch (error){
        await session.abortTransaction();
        await session.endSession();

        console.error('Server error:', error.message);
        res.status(500).json({ error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        await verifyPassword(password, user.password_hash);

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        user.refresh_token = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, RT_pattern);

        req.session.userId = user.id;
        req.session.userName = user.user_name;

        res.status(200).json({ message: 'Logged in successfully', access_token: accessToken });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: error.message });
    }
}

const logout = async (req, res) => {
    try{
        return res
            .clearCookie("refreshToken")
            .status(200)
            .json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error });
    }
}

const token = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }

    try{
        const decoded = jwt.verify(refreshToken, process.env.SECRETKEY_REFRESH);
        const user = await findUserById(decoded.id);

        if (!user) {
            res.clearCookie("refreshToken");
            return res.status(403).json({ message: "Invalid refresh token "});
        }

        const accessToken = await generateAccessToken(user);
        return res.json({ accessToken });
    } catch (error){
        console.error('Search error:', error);
        return res.status(403).json({
            message: error.name === 'TokenExpiredError'
                ? 'Refresh token expired'
                : 'Invalid refresh token'
        });
    }
}

const verifyToken = async (req, res) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header is missing" });
        }
        const tokenParts = authHeader.split(' ');
        if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
            return res.status(400).json({ error: "Invalid token" });
        }
        const token = tokenParts[1];

        try{
            const decodedToken = jwt.verify(token, process.env.SECRETKEY_ACCESS);
            await findUserById(decodedToken.id);
            return res.status(200).json({ message: 'verified' });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ error: isDev ? error.message : "Error during verifying token" });
    }
}

module.exports = { register, login, logout, token, verifyToken}