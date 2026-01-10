const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
    index: { type: Number },
    item: { type: mongoose.Schema.Types.Mixed, required: true },
})

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true, unique: true },
    definition: { type: String, default: 'User', immutable: true },
    url_avatar: { type: String, default: "none" },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    refresh_token: { type: String },
    library_collection: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryCollection"},
    artist_profile: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null },
    created_at: { type: Date, default: Date.now }
}, { collection: "usersData"});    

module.exports = mongoose.model('User', userSchema)