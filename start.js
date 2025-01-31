// Load environment variables from cPanel configuration
const app = require('./src/app');
const fs = require('fs');
const path = require('path');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    console.log(logMessage);
    logStream.write(logMessage);
}

// Set default port
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start the server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use. Please try a different port.`);
                process.exit(1);
            } else {
                logger.error('Server error:', error);
                process.exit(1);
            }
        });

        // Handle process termination
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

// Log environment variables (excluding sensitive data)
log(`Starting application with:`);
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`PORT: ${PORT}`);
log(`LOG_LEVEL: ${process.env.LOG_LEVEL}`);

process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`);
    log(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    log(`Unhandled Rejection: ${err.message}`);
    log(err.stack);
});

process.on('SIGINT', () => {
    log('Received SIGINT. Performing graceful shutdown...');
    logStream.end();
    process.exit(0);
});
