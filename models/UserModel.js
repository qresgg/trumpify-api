const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
    title: {type: String, required: true},
    duration: { type: String, required: true},
    featuring: [{ artist: String }]
})

const LikedSongsSchema = new mongoose.Schema({
    title: {type: String, required: true},
    type: {type: String, required: true},
    tracks: [TrackSchema]
})

const UserSchema = new mongoose.Schema({
    id: {type: Number},
    user_name: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password_hash: {type: String, required: true},
    role: {type: String, default: 'user'},
    access_token: {type: String},
    refresh_token: {type: String},
    created_at: {type: Date},
    liked_songs: [LikedSongsSchema]
}, { collection: "usersData" });
    
module.exports = mongoose.model('User', UserSchema)