const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    console.log(logMessage.trim());
    logStream.write(logMessage);
}

// Log startup information
log('Starting application...');

// Import dependencies
const app = require('./src/app');

// Connect to MongoDB
const connectDB = require('./src/config/database');
connectDB()
    .then(() => {
        log('MongoDB connected successfully');
    })
    .catch((err) => {
        log('MongoDB connection error:', err);
    });

// Set default port for local development
const PORT = process.env.PORT || 3000;

// Log environment variables (excluding sensitive data)
log(`Environment Configuration:`);
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`PORT: ${PORT}`);
log(`LOG_LEVEL: ${process.env.LOG_LEVEL}`);

// Start the server if we're not in production
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
