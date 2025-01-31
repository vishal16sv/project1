const express = require('express');
const router = express.Router();
const sportexService = require('../services/sportex');
const logger = require('winston');

// Get live matches
router.get('/live', async (req, res) => {
    try {
        const matches = await sportexService.getLiveMatches();
        res.json(matches);
    } catch (error) {
        logger.error('Error fetching live matches:', error.message);
        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch live matches'
        });
    }
});

// Get recent matches
router.get('/recent', async (req, res) => {
    try {
        const matches = await sportexService.getRecentMatches();
        res.json(matches);
    } catch (error) {
        logger.error('Error fetching recent matches:', error.message);
        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch recent matches'
        });
    }
});

// Get upcoming matches
router.get('/upcoming', async (req, res) => {
    try {
        const matches = await sportexService.getUpcomingMatches();
        res.json(matches);
    } catch (error) {
        logger.error('Error fetching upcoming matches:', error.message);
        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch upcoming matches'
        });
    }
});

// Get match details
router.get('/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await sportexService.getMatchDetails(matchId);
        if (!match) {
            return res.status(404).json({
                status: 'error',
                message: 'Match not found'
            });
        }
        res.json(match);
    } catch (error) {
        logger.error('Error fetching match details:', error.message);
        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch match details'
        });
    }
});

module.exports = router;
