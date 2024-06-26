const mongoose = require('mongoose');

const ClanMessageSchema = new mongoose.Schema({
    clanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClanMessage', ClanMessageSchema);