const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metalResearch: { type: Number, default: 0 },
    crystalResearch: { type: Number, default: 0 },
    deuteriumResearch: { type: Number, default: 0 },
    shipBuilding: { type: Number, default: 0 },
    weaponTypes: { type: [Number], default: [0, 0, 0] }, // 3 Weapon Types
    shieldTypes: { type: [Number], default: [0, 0, 0] }, // 3 Shield Types
    planetaryShield: { type: Number, default: 0 },
    colonization: { type: Number, default: 0, max: 20 },
    espionage: { type: Number, default: 0, max: 20 },
    counterEspionage: { type: Number, default: 0, max: 20 },
    createdAt: { type: Date, default: Date.now }
});

ResearchSchema.methods.getMaxPlanets = function() {
    const baseLimit = 5;
    const increasePerLevel = 0.05; // 5% increase per level
    return Math.min(Math.floor(baseLimit * (1 + this.colonization * increasePerLevel)), 500);
};

module.exports = mongoose.model('Research', ResearchSchema);