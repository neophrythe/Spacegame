const mongoose = require('mongoose');

const FleetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raven: { type: Number, default: 0 },
    marauder: { type: Number, default: 0 },
    vandal: { type: Number, default: 0 },
    stinger: { type: Number, default: 0 },
    brawler: { type: Number, default: 0 },
    devastator: { type: Number, default: 0 },
    sentinel: { type: Number, default: 0 },
    fortress: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    colony: { type: Number, default: 0 },
    spyDrones: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fleet', FleetSchema);