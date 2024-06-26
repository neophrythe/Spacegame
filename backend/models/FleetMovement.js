const mongoose = require('mongoose');

const FleetMovementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originPlanetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Planet', required: true },
    destinationPlanetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Planet', required: true },
    ships: {
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
        spyDrones: { type: Number, default: 0 }
    },
    resources: {
        metal: { type: Number, default: 0 },
        crystal: { type: Number, default: 0 },
        deuterium: { type: Number, default: 0 }
    },
    mission: { type: String, enum: ['attack', 'colonize', 'transfer'], required: true },
    startTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true }
});

module.exports = mongoose.model('FleetMovement', FleetMovementSchema);