const mongoose = require('mongoose');
const regionSchema = require('./shared/region.schema');
const genreSchema = require('./shared/genre.schema');

const labelSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String }
}, { _id: false })

const refSchema = new mongoose.Schema({
    labels: [ labelSchema ],
    regions: [ regionSchema ],
    genres: [ genreSchema ]
}, { collection: "reference_data" });

module.exports = mongoose.model('Ref', refSchema);