const mongoose = require("mongoose")

const regionSchema = new mongoose.Schema({
    id: { type: Number }, 
    code: { type: String },
    country: { type: String },
    language: { type: String }
}, { _id: false })

module.exports = { regionSchema }