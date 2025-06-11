const mongoose = require("mongoose")

const artistSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    definition: { type: String, default: 'Artist', immutable: true },
    artist_avatar: { type: String, default: "none"},
    artist_listeners: { type: Number, default: 0},
    artist_subscribers: { type: Number, default: 0},
    artist_banner: { type: String, default: "none" },
    name: { type: String, required: true, unique: true },
    bio: { type: String },
    is_verified: { type: Boolean, default: false },
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "Album" }],
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    created_at: { type: Date, default: Date.now }
  }, { collection: "artistsData"});
  
  module.exports = mongoose.model("Artist", artistSchema);