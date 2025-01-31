const sportexService = require('../../src/services/sportex');

describe('SportexService', () => {
    describe('getLiveMatches', () => {
        it('should return live matches', async () => {
            const result = await sportexService.getLiveMatches();
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
        });
    });

    describe('getRecentMatches', () => {
        it('should return recent matches', async () => {
            const result = await sportexService.getRecentMatches();
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
        });
    });

    describe('getUpcomingMatches', () => {
        it('should return upcoming matches', async () => {
            const result = await sportexService.getUpcomingMatches();
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
        });
    });
});
