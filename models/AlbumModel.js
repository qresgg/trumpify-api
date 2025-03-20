const mongoose = require('mongoose');

// const TrackSchema = new mongoose.Schema({
//     title: {type: String, required: true},
//     duration: { type: String, required: true},
//     featuring: [{ artist: String }]
// })

// const AlbumSchema = new mongoose.Schema({
//     id: {type: Number, required: true},
//     title: {type: String, required: true},
//     artist: {type: String, required: true},
//     year: {type: Number, required: true},
//     type: { type: String, enum: ['Album', 'Short-Album'], required: true},
//     tracks: [TrackSchema]
// }, { collection: "playlistsData" });
    

const AlbumSchema = new mongoose.Schema({
    title: {type: String, required: true},
    cover: {type: String },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    artist_name: { type: String, required: true },
    record_label: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    genre: { type: String },
    type: { type: String, enum: ['Album', 'Short-Album'], required: true},
    language: { type: String, required: true},
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
}, { collection: "albumsData" });

module.exports = mongoose.model('Album', AlbumSchema);