const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
    title: {type: String, required: true},
    duration: { type: String, required: true},
    featuring: [{ artist: String }]
})

const AlbumSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    title: {type: String, required: true},
    artist: {type: String, required: true},
    year: {type: Number, required: true},
    type: { type: String, enum: ['Album', 'EP'], required: true},
    tracks: [TrackSchema]
}, { collection: "playlistsData" });
    
module.exports = mongoose.model('Album', AlbumSchema);