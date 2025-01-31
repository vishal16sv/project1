// Environment variables are set in cPanel
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await connectDB();
        res.status(200).json({ status: 'ok', message: 'Database connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// Root endpoint
app.get('/api', async (req, res) => {
    try {
        await connectDB();
        res.status(200).json({ message: 'Cricket API is running' });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Import and use routes
const matchesRouter = require('./routes/matches');
app.use('/api/matches', matchesRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.info(`Server is running on port ${port}`);
});

// Export the app
module.exports = app;
