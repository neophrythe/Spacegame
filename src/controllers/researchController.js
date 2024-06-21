const Research = require('../models/Research');

exports.getResearch = async (req, res) => {
    try {
        const research = await Research.findOne({ userId: req.user.id });
        res.json(research);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.upgradeResearch = async (req, res) => {
    const { researchType } = req.body;
    try {
        const research = await Research.findOne({ userId: req.user.id });
        if (research) {
            research[researchType]++;
            await research.save();
            res.json(research);
        } else {
            res.status(404).json({ error: 'Research not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
