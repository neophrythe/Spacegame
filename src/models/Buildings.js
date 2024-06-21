const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metalMine: { level: Number, default: 0 },
    crystalMine: { level: Number, default: 0 },
    deuteriumMine: { level: Number, default: 0 },
    researchCenter: { level: Number, default: 0 },
    shipyard: { level: Number, default: 0 },
    ionCannon: { level: Number, default: 0 },
    ionShield: { level: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Building', BuildingSchema);
