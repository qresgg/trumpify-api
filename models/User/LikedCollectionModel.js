const mongoose = require('mongoose')

const LikedCollectionModel = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    definition: { type: String, default: 'Collection'},
    privacy_type: { type: String, default: "private", enum: ['private', 'public']},
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song'}]
}, { collection: "likedCollectionData"})

module.exports = mongoose.model("LikedCol", LikedCollectionModel)