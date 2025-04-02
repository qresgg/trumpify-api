const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true, unique: true },
    definition: { type: String, default: 'User', immutable: true },
    url_avatar: { type: String, default: "none" },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    refresh_token: { type: String },
    liked_collection: { type: mongoose.Schema.Types.ObjectId, ref: "LikedCol"},
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
    artist_profile: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null },
    created_at: { type: Date, default: Date.now }
}, { collection: "usersData"});    

module.exports = mongoose.model('User', userSchema)