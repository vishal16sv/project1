const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    matchId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    competitionId: {
        type: String,
        required: true
    },
    competitionName: {
        type: String,
        required: true
    },
    title: String,
    shortTitle: String,
    status: String,
    statusStr: String,
    dateStart: Date,
    dateEnd: Date,
    teams: {
        home: {
            id: String,
            name: String,
            shortName: String,
            score: String
        },
        away: {
            id: String,
            name: String,
            shortName: String,
            score: String
        }
    },
    venue: {
        id: String,
        name: String,
        city: String,
        country: String
    },
    format: String,
    matchDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    liveScore: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    commentary: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    scorecard: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
matchSchema.index({ competitionId: 1 });
matchSchema.index({ dateStart: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
