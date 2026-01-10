const mongoose = require('mongoose')

const LibraryCollectionModel = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    definition: { type: String, default: 'Collection', immutable: true},
    privacy_type: { type: String, default: "private", enum: ['private', 'public']},
    liked: {
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song'}],
        albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album'}]
    }
}, { collection: "libraryCollectionData"})

module.exports = mongoose.model("LibraryCollection", LibraryCollectionModel)