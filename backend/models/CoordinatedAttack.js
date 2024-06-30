const mongoose = require('mongoose');

const CoordinatedAttackSchema = new mongoose.Schema({
    attackCode: { type: String, required: true, unique: true },
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetPlanet: { type: mongoose.Schema.Types.ObjectId, ref: 'Planet', required: true },
    arrivalTime: { type: Date, required: true },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fleet: { type: Map, of: Number },
        speedPercentage: { type: Number, min: 5, max: 100, default: 100 }
    }],
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CoordinatedAttack', CoordinatedAttackSchema);