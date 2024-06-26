const Research = require('../models/Research');
const { calculateResearchTime, applyResearchEffects } = require('../utils/researchUtils');

exports.upgradeResearch = async (req, res) => {
    const { researchType } = req.body;
    try {
        const research = await Research.findOne({ userId: req.user.id });
        if (research) {
            const researchTime = calculateResearchTime(research[researchType], researchType);
            research.researchQueue.push({ type: researchType, completionTime: new Date(Date.now() + researchTime * 1000) });
            await research.save();
            res.json(research);
        } else {
            res.status(404).json({ error: 'Research not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Other researchController methods
exports.getResearch = async (req, res) => {
    try {
        const research = await Research.findOne({ userId: req.user.id });
        if (research) {
            res.json(research);
        } else {
            res.status(404).json({ error: 'Research not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};