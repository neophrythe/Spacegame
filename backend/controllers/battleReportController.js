const BattleReport = require('../models/BattleReport');

exports.getAllBattleReports = async (req, res) => {
    try {
        const battleReports = await BattleReport.find({ $or: [{ attackerId: req.user.id }, { defenderId: req.user.id }] })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(battleReports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching battle reports', error: error.message });
    }
};

exports.getBattleReport = async (req, res) => {
    try {
        const battleReport = await BattleReport.findById(req.params.id);
        if (!battleReport) {
            return res.status(404).json({ message: 'Battle report not found' });
        }
        if (battleReport.attackerId.toString() !== req.user.id && battleReport.defenderId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(battleReport);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching battle report', error: error.message });
    }
};