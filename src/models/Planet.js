const mongoose = require('mongoose');
const { calculateResourceProduction } = require('../gameLogic');

const PlanetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    galaxy: { type: Number, required: true },
    system: { type: Number, required: true },
    position: { type: Number, required: true },
    buildings: {
        metalMine: { type: Number, default: 0 },
        crystalMine: { type: Number, default: 0 },
        deuteriumMine: { type: Number, default: 0 },
        researchCenter: { type: Number, default: 0 },
        shipyard: { type: Number, default: 0 },
        ionCannon: { type: Number, default: 0 },
        ionShield: { type: Number, default: 0 }
    },
    resources: {
        metal: { type: Number, default: 500 },
        crystal: { type: Number, default: 300 },
        deuterium: { type: Number, default: 100 }
    },
    lastResourceUpdate: { type: Date, default: Date.now }
});

PlanetSchema.methods.updateResources = function(research) {
    const now = new Date();
    const timeDiff = (now - this.lastResourceUpdate) / 3600000; // time difference in hours

    this.resources.metal += calculateResourceProduction(this.buildings.metalMine, research.metalResearch) * timeDiff;
    this.resources.crystal += calculateResourceProduction(this.buildings.crystalMine, research.crystalResearch) * timeDiff;
    this.resources.deuterium += calculateResourceProduction(this.buildings.deuteriumMine, research.deuteriumResearch) * timeDiff;

    this.lastResourceUpdate = now;
};

module.exports = mongoose.model('Planet', PlanetSchema);