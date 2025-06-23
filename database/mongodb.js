const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
    const { LOGIN, PASSWORD, DATABASE_NAME, CLUSTER, NODE_ENV,
        LOGIN_DB_ALT, PASSWORD_DB_ALT, CLUSTER_DB_ALT, DATABASE_NAME_ALT
    } = process.env;

    const uri = (NODE_ENV === 'development' 
        ? `mongodb+srv://${LOGIN_DB_ALT}:${PASSWORD_DB_ALT}@${CLUSTER_DB_ALT}.dvlhbhx.mongodb.net/${DATABASE_NAME_ALT}` 
        : `mongodb+srv://${LOGIN}:${PASSWORD}@${CLUSTER}.ppxm4.mongodb.net/${DATABASE_NAME}`);
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    }
};

module.exports = { connectDB };