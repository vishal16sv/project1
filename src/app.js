// Environment variables are set in cPanel
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'), 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log')
        })
    ]
});

// Make logger global
global.logger = logger;

// Create Express app
const app = express();

// Connect to MongoDB
(async () => {
    try {
        await connectDB();
        logger.info('MongoDB connected successfully');
    } catch (err) {
        logger.error('MongoDB connection error:', err);
        // Don't exit process, allow the app to run even if DB connection fails initially
    }
})();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' })
}));

// Basic request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT
    });
});

// Import and use routes
const matchesRouter = require('./routes/matches');
app.use('/api/matches', matchesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

// Export the app
module.exports = app;
