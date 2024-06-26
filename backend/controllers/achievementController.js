const { createNotification } = require('./notificationController');

const achievements = {
    FIRST_COLONY: { id: 'FIRST_COLONY', name: 'First Colony', description: 'Colonize your first planet' },
    FLEET_MASTER: { id: 'FLEET_MASTER', name: 'Fleet Master', description: 'Build a fleet of 1000 ships' },
    RESOURCE_BARON: { id: 'RESOURCE_BARON', name: 'Resource Baron', description: 'Accumulate 1,000,000 of each resource' },
    BATTLE_HARDENED: { id: 'BATTLE_HARDENED', name: 'Battle Hardened', description: 'Win 100 battles' },
    SCIENTIST: { id: 'SCIENTIST', name: 'Scientist', description: 'Complete all research' }
};

const checkAchievement = async (userId, achievementId) => {
    try {
        const userAchievement = await UserAchievement.findOne({ userId, achievementId });
        if (!userAchievement) {
            const newAchievement = new UserAchievement({
                userId,
                achievementId,
                unlockedAt: new Date()
            });
            await newAchievement.save();

            const achievementDetails = achievements[achievementId];
            await createNotification(userId, 'achievement_unlocked', `You've unlocked the "${achievementDetails.name}" achievement!`);
        }
    } catch (error) {
        console.error('Error in checkAchievement:', error);
    }
};

const getUserAchievements = async (req, res) => {
    try {
        const userAchievements = await UserAchievement.find({ userId: req.user.id });
        const achievementDetails = userAchievements.map(ua => ({
            ...achievements[ua.achievementId],
            unlockedAt: ua.unlockedAt
        }));
        res.json(achievementDetails);
    } catch (error) {
        console.error('Error in getUserAchievements:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    checkAchievement,
    getUserAchievements,
    achievements
};