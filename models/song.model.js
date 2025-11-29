const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role: { type: String}
})

const featureSchema = new mongoose.Schema({
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist"},
    name: { type: String },
    roles: [roleSchema],
});

const genreSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true }
})

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    definition: { type: String, default: 'Song', immutable: true },
    features: [featureSchema],
    song_cover: { type: String, default: 'none'},
    song_file: { type: String, default: 'none'},
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    duration: { type: String },
    genre: [genreSchema],
    type: { type: String },
    is_explicit: { type: Boolean },
    playback: { type: Number, default: 0},
    likes_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
}, { collection: "songsData" });
  
module.exports = mongoose.model("Song", songSchema);