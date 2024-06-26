const mongoose = require('mongoose');

const GalaxySchema = new mongoose.Schema({
    name: { type: String, required: true },
    systems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Galaxy', GalaxySchema);
