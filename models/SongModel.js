const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    role: { type: String, required: true },
});

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    features: [featureSchema],
    song_cover: { type: String, required: true},
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    duration: { type: String, required: true },
    genre: { type: String, default: 'default' },
    type: { type: String },
    playback: { type: Number, default: 0},
    likesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { collection: "songsData" });
  
module.exports = mongoose.model("Song", songSchema);