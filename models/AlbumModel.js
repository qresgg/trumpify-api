const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title: {type: String, required: true},
    definition: { type: String, default: 'Album', immutable: true },
    cover: {type: String, default: 'none' },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    artist_name: { type: String, required: true },
    record_label: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    genre: { type: String },
    type: { type: String, enum: ['Album', 'Short-Album'], required: true},
    language: { type: String, required: true},
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
}, { collection: "albumsData" });

module.exports = mongoose.model('Album', albumSchema);