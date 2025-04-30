const User = require("../../models/User/UserModel");
const LikedCollection = require("../../models/User/LikedCollectionModel");

const createUser = async (username, email, hashedPassword) => {
    const newUser = new User({
        user_name: username,
        email: email,
        password_hash: hashedPassword,
        created_at: Date.now()
    });    
    await newUser.save();

    return newUser;
}

const createLikedCollection = async (user) => {
    const newLikedCollection = new LikedCollection({ 
        user_id: user._id
    })
    await newLikedCollection.save();
    user.liked_collection = newLikedCollection._id;
    
    await user.save();
    return newLikedCollection;
}

module.exports = { createUser, createLikedCollection }