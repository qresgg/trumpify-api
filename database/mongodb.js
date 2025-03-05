const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
const { LOGIN, PASSWORD, DATABASE_NAME, CLUSTER} = process.env;

const uri = `mongodb+srv://${LOGIN}:${PASSWORD}@${CLUSTER}.ppxm4.mongodb.net/${DATABASE_NAME}`;
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    }
};

module.exports = { connectDB };