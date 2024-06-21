const mongoose = require('mongoose');

const SystemSchema = new mongoose.Schema({
    galaxyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Galaxy', required: true },
    name: { type: String, required: true },
    planets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Planet' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('System', SystemSchema);
