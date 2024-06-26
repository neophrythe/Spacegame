const mongoose = require('mongoose');

const UserAchievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserAchievement', UserAchievementSchema);