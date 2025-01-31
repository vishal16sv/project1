const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, opts);
        cachedConnection = conn;
        console.log('MongoDB Connected');
        return conn;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

module.exports = connectDB;
