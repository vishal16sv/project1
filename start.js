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

// Get port from environment variable with fallback
const port = parseInt(process.env.PORT || '3000', 10);

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

// Function to start server
const startServer = () => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, '0.0.0.0', () => {
            log(`Server is running on port ${port}`);
            resolve(server);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                log(`Port ${port} is already in use. Trying again...`);
                setTimeout(() => {
                    server.close();
                    reject(err);
                }, 1000);
            } else {
                log(`Failed to start server: ${err.message}`);
                reject(err);
            }
        });
    });
};

// Attempt to start server with retries
const MAX_RETRIES = 3;
let retries = 0;

const attemptStart = async () => {
    try {
        await startServer();
    } catch (err) {
        retries++;
        if (retries < MAX_RETRIES) {
            log(`Retry attempt ${retries} of ${MAX_RETRIES}`);
            setTimeout(attemptStart, 2000);
        } else {
            log(`Failed to start server after ${MAX_RETRIES} attempts`);
            process.exit(1);
        }
    }
};

attemptStart();
