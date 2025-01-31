// Load environment variables from cPanel configuration
const app = require('./src/index.js');
const fs = require('fs');
const path = require('path');

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

const port = process.env.PORT || 3033;

// Log environment variables (excluding sensitive data)
log(`Starting application with:`);
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`PORT: ${port}`);
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

// Graceful shutdown
process.on('SIGTERM', () => {
    log('Received SIGTERM. Performing graceful shutdown...');
    logStream.end();
    process.exit(0);
});

process.on('SIGINT', () => {
    log('Received SIGINT. Performing graceful shutdown...');
    logStream.end();
    process.exit(0);
});

try {
    app.listen(port, '127.0.0.1', () => {
        log(`Server is running on port ${port}`);
    }).on('error', (err) => {
        log(`Failed to start server: ${err.message}`);
        throw err;
    });
} catch (err) {
    log(`Critical error starting server: ${err.message}`);
    log(err.stack);
    process.exit(1);
}
