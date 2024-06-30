const mongoose = require('mongoose');

const SystemSchema = new mongoose.Schema({
    galaxyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Galaxy', required: true },
    id: { type: Number, required: true },
    planets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Planet' }]
});

module.exports = mongoose.model('System', SystemSchema);