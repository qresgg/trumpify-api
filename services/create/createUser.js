const User = require("../../models/user.model");
const LibraryCollection = require("../../models/libraryCollection.model");

const createUser = async (username, email, hashedPassword, session) => {
    const newUser = new User({
        user_name: username,
        email: email,
        password_hash: hashedPassword,
        created_at: Date.now(),
        url_avatar: `https://placehold.co/100x100/1F1F1F/FFFFFF?text=${username[0]}`
    });    
    await newUser.save({ session });

    return newUser;
}

const createLibraryCollection = async (user, session) => {
    const newLibraryCollection = new LibraryCollection({
        user_id: user._id
    })
    await newLibraryCollection.save({ session});
    user.library_collection = newLibraryCollection._id;
    
    await user.save({ session });
    return newLibraryCollection;
}

module.exports = { createUser, createLibraryCollection }