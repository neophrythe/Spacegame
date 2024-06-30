const mongoose = require('mongoose');

const GalaxySchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    systems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
    isFull: { type: Boolean, default: false }
});

module.exports = mongoose.model('Galaxy', GalaxySchema);