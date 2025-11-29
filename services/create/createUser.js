const User = require("../../models/user.model");
const LikedCollection = require("../../models/likedCollection.model");

const createUser = async (username, email, hashedPassword) => {
    const newUser = new User({
        user_name: username,
        email: email,
        password_hash: hashedPassword,
        created_at: Date.now(),
        url_avatar: `https://placehold.co/100x100/1F1F1F/FFFFFF?text=${username[0]}`
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