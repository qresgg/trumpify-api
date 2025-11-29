const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    definition: { type: String, default: 'Playlist', immutable: true },
    privacy_type: { type: String, enum: ['private', 'public']},
    url_cover: { type: String, default: "none" },
    title: { type: String, required: true },
    description: { type: String },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    created_at: { type: Date, default: Date.now }
}, {collection: "playlistData"});
  
module.exports = mongoose.model("Playlist", playlistSchema);
  