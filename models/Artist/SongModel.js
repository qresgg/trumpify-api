const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role: { type: String}
})

const featureSchema = new mongoose.Schema({
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist"},
    name: { type: String },
    roles: [roleSchema],
});

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    definition: { type: String, default: 'User', immutable: true },
    features: [featureSchema],
    song_cover: { type: String, default: 'none'},
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    duration: { type: String, required: true },
    genre: { type: String, default: 'default' },
    type: { type: String },
    is_explicit: { type: Boolean },
    playback: { type: Number, default: 0},
    likesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { collection: "songsData" });
  
module.exports = mongoose.model("Song", songSchema);