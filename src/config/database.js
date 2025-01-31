const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://admin_v:Vishal@admin@cluster0.jmbsf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            dbName: 'cricket_api',
            retryWrites: true,
            w: 'majority'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Log more details about the error
        if (err.name === 'MongoServerSelectionError') {
            console.error('Failed to connect to MongoDB server. Please check:');
            console.error('1. MongoDB Atlas network access settings');
            console.error('2. IP whitelist');
            console.error('3. Database user credentials');
            console.error('4. Database name and connection string format');
        }
        throw err;
    }
};

module.exports = connectDB;
