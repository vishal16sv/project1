const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('winston');
const Match = require('../models/match');

class SportexService {
    constructor() {
        this.baseUrl = 'https://api.sportex.club/user/match';
        this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
        this.axios = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });

        // Add response interceptor for better error handling
        this.axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    logger.error('SportEx API Error Response:', {
                        status: error.response.status,
                        data: error.response.data,
                        headers: error.response.headers,
                        url: error.config.url
                    });
                } else if (error.request) {
                    logger.error('SportEx API No Response:', {
                        request: error.request,
                        url: error.config.url
                    });
                } else {
                    logger.error('SportEx API Request Setup Error:', error.message);
                }
                throw error;
            }
        );
    }

    async makeRequest(endpoint, params = {}) {
        try {
            const response = await this.axios.get(endpoint, { params });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch data from SportEx API: ${error.message}`);
        }
    }

    async saveMatch(matchData) {
        try {
            const match = await Match.findOneAndUpdate(
                { matchId: matchData.matchId },
                { 
                    $set: {
                        ...matchData,
                        lastUpdated: new Date()
                    }
                },
                { 
                    upsert: true,
                    new: true
                }
            );
            return match;
        } catch (error) {
            logger.error('Error saving match to database:', error);
            throw error;
        }
    }

    async getLiveMatches() {
        const cacheKey = 'live_matches';
        try {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                logger.debug('Returning cached live matches');
                return cached;
            }

            // Get live matches list
            const liveMatches = await this.makeRequest('/liveMatches', { limit: 10, page: 0 });
            
            if (!liveMatches?.data?.length) {
                return { data: [] };
            }

            // Get detailed data for each live match
            const matchesWithDetails = await Promise.all(
                liveMatches.data.map(async (match) => {
                    try {
                        const [liveScore, commentary] = await Promise.all([
                            this.makeRequest('/liveMatchData', { matchId: match.id }),
                            this.makeRequest('/matchDetail/live', { matchId: match.id })
                        ]);

                        const matchData = {
                            ...match,
                            liveScore: liveScore.data,
                            commentary: commentary.data,
                            status: 'live'
                        };

                        // Save to database
                        await this.saveMatch(matchData);
                        return matchData;
                    } catch (error) {
                        logger.error(`Error fetching details for match ${match.id}:`, error.message);
                        return match;
                    }
                })
            );

            const data = { data: matchesWithDetails };
            this.cache.set(cacheKey, data, 30); // Cache for 30 seconds
            return data;
        } catch (error) {
            logger.error('Error in getLiveMatches:', error.message);
            throw error;
        }
    }

    async getRecentMatches() {
        const cacheKey = 'recent_matches';
        try {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                logger.debug('Returning cached recent matches');
                return cached;
            }

            // Get recent matches list
            const recentMatches = await this.makeRequest('/recentMatches', { limit: 50, page: 0 });
            
            if (!recentMatches?.data?.length) {
                return { data: [] };
            }

            // Get detailed data for each recent match
            const matchesWithDetails = await Promise.all(
                recentMatches.data.map(async (match) => {
                    try {
                        const scorecard = await this.makeRequest('/matchDetail/info', { matchId: match.id });
                        const matchData = {
                            ...match,
                            scorecard: scorecard.data,
                            status: 'completed'
                        };

                        // Save to database
                        await this.saveMatch(matchData);
                        return matchData;
                    } catch (error) {
                        logger.error(`Error fetching details for match ${match.id}:`, error.message);
                        return match;
                    }
                })
            );

            const data = { data: matchesWithDetails };
            this.cache.set(cacheKey, data, 300); // Cache for 5 minutes
            return data;
        } catch (error) {
            logger.error('Error in getRecentMatches:', error.message);
            throw error;
        }
    }

    async getUpcomingMatches() {
        const cacheKey = 'upcoming_matches';
        try {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                logger.debug('Returning cached upcoming matches');
                return cached;
            }

            // Get upcoming matches list
            const upcomingMatches = await this.makeRequest('/upcomming', { limit: 250, page: 0 });
            
            if (!upcomingMatches?.data?.length) {
                return { data: [] };
            }

            // Get detailed data for each upcoming match
            const matchesWithDetails = await Promise.all(
                upcomingMatches.data.map(async (match) => {
                    try {
                        const matchDetails = await this.makeRequest('/matchDetail/info', { matchId: match.id });
                        const matchData = {
                            ...match,
                            details: matchDetails.data,
                            status: 'scheduled'
                        };

                        // Save to database
                        await this.saveMatch(matchData);
                        return matchData;
                    } catch (error) {
                        logger.error(`Error fetching details for match ${match.id}:`, error.message);
                        return match;
                    }
                })
            );

            const data = { data: matchesWithDetails };
            this.cache.set(cacheKey, data, 300); // Cache for 5 minutes
            return data;
        } catch (error) {
            logger.error('Error in getUpcomingMatches:', error.message);
            throw error;
        }
    }

    async getMatchDetails(matchId) {
        const cacheKey = `match_${matchId}`;
        try {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                logger.debug('Returning cached match details');
                return cached;
            }

            const matchDetails = await this.makeRequest('/matchDetail/info', { matchId });
            const matchData = {
                ...matchDetails.data,
                matchId
            };

            // Save to database
            await this.saveMatch(matchData);

            const data = { data: matchData };
            this.cache.set(cacheKey, data, 300); // Cache for 5 minutes
            return data;
        } catch (error) {
            logger.error('Error in getMatchDetails:', error.message);
            throw error;
        }
    }
}

module.exports = new SportexService();
