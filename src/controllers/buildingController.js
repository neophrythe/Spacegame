const Planet = require('../models/Planet');
const Research = require('../models/Research');
const { calculateBuildingTime } = require('../gameLogic');

exports.upgradeBuilding = async (req, res) => {
    const { planetId, buildingType } = req.body;

    try {
        const planet = await Planet.findOne({ _id: planetId, userId: req.user.id });
        if (!planet) {
            return res.status(404).json({ message: 'Planet not found' });
        }

        const research = await Research.findOne({ userId: req.user.id });
        planet.updateResources(research);

        const currentLevel = planet.buildings[buildingType];
        const upgradeCost = calculateUpgradeCost(buildingType, currentLevel);
        const buildTime = calculateBuildingTime(currentLevel, buildingType);

        if (planet.resources.metal < upgradeCost.metal ||
            planet.resources.crystal < upgradeCost.crystal ||
            planet.resources.deuterium < upgradeCost.deuterium) {
            return res.status(400).json({ message: 'Insufficient resources' });
        }

        planet.resources.metal -= upgradeCost.metal;
        planet.resources.crystal -= upgradeCost.crystal;
        planet.resources.deuterium -= upgradeCost.deuterium;

        // Schedule the upgrade completion
        setTimeout(async () => {
            planet.buildings[buildingType]++;
            await planet.save();
        }, buildTime * 1000);

        await planet.save();

        res.json({ message: 'Building upgrade started', completionTime: new Date(Date.now() + buildTime * 1000) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateUpgradeCost(buildingType, currentLevel) {
    // Implement your cost calculation logic here
    // This is a placeholder implementation
    const baseCosts = {
        'metalMine': { metal: 60, crystal: 15, deuterium: 0 },
        'crystalMine': { metal: 48, crystal: 24, deuterium: 0 },
        'deuteriumMine': { metal: 225, crystal: 75, deuterium: 0 },
        'researchCenter': { metal: 200, crystal: 400, deuterium: 200 },
        'shipyard': { metal: 400, crystal: 200, deuterium: 100 },
        'ionCannon': { metal: 5000, crystal: 3000, deuterium: 1000 },
        'ionShield': { metal: 10000, crystal: 5000, deuterium: 2500 }
    };

    const baseCost = baseCosts[buildingType];
    const factor = Math.pow(1.5, currentLevel);

    return {
        metal: Math.floor(baseCost.metal * factor),
        crystal: Math.floor(baseCost.crystal * factor),
        deuterium: Math.floor(baseCost.deuterium * factor)
    };
}