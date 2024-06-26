const Building = require('../models/Building');

exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.findOne({ userId: req.user.id });
        res.json(buildings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.upgradeBuilding = async (req, res) => {
    const { buildingType } = req.body;
    try {
        const buildings = await Building.findOne({ userId: req.user.id });
        if (buildings) {
            buildings[buildingType]++;
            await buildings.save();
            res.json(buildings);
        } else {
            res.status(404).json({ error: 'Buildings not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
