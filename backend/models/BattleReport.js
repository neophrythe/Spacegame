const mongoose = require('mongoose');

const BattleReportSchema = new mongoose.Schema({
    attackerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    defenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attackerClanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan' },
    defenderClanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan' },
    attackerFleetInitial: { type: Map, of: Number },
    defenderFleetInitial: { type: Map, of: Number },
    attackerResearch: {
        weaponsTechnology: Number,
        shieldingTechnology: Number,
        armorTechnology: Number,
    },
    defenderResearch: {
        weaponsTechnology: Number,
        shieldingTechnology: Number,
        armorTechnology: Number,
    },
    rounds: [{
        round: Number,
        attackerDamage: Number,
        defenderDamage: Number,
        attackerShipsRemaining: { type: Map, of: Number },
        defenderShipsRemaining: { type: Map, of: Number },
    }],
    attackerLosses: { type: Map, of: Number },
    defenderLosses: { type: Map, of: Number },
    resourcesLooted: {
        metal: Number,
        crystal: Number,
        deuterium: Number
    },
    winner: { type: String, enum: ['attacker', 'defender', 'draw'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BattleReport', BattleReportSchema);