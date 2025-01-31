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
let app;
try {
    app = require('./src/app');
} catch (err) {
    log(`Failed to load app module: ${err.message}`);
    if (err.code === 'MODULE_NOT_FOUND') {
        log('Checking for index.js instead...');
        try {
            app = require('./src/index');
        } catch (innerErr) {
            log(`Failed to load index.js as well: ${innerErr.message}`);
            process.exit(1);
        }
    } else {
        process.exit(1);
    }
}

const connectDB = require('./src/config/database');

// Initialize logger with fallback
let logger;
try {
    logger = require('./src/utils/logger');
} catch (err) {
    log('Warning: Logger module not found, using console logging');
    logger = {
        info: (msg) => log(`INFO: ${msg}`),
        error: (msg, err) => {
            log(`ERROR: ${msg}`);
            if (err && err.stack) log(err.stack);
        },
        warn: (msg) => log(`WARN: ${msg}`),
        debug: (msg) => log(`DEBUG: ${msg}`)
    };
}

// Connect to MongoDB
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

// Start the server if we're not in Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        log(`Server is running on port ${PORT}`);
        logger.info(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    app.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            log(`Port ${PORT} is already in use. Please try a different port.`);
            logger.error(`Port ${PORT} is already in use. Please try a different port.`);
            process.exit(1);
        } else {
            log(`Server error: ${error.message}`);
            logger.error('Server error:', error);
            process.exit(1);
        }
    });

    // Handle process termination
    process.on('SIGTERM', () => {
        log('SIGTERM received. Shutting down gracefully...');
        logger.info('SIGTERM received. Shutting down gracefully...');
        app.close(() => {
            log('Server closed');
            logger.info('Server closed');
            process.exit(0);
        });
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    log('Uncaught Exception:');
    log(err.message);
    log(err.stack);
    process.exit(1);
});

// Handle SIGINT
process.on('SIGINT', () => {
    log('Received SIGINT. Performing graceful shutdown...');
    logStream.end();
    process.exit(0);
});

// Export the app for Vercel
module.exports = app;
