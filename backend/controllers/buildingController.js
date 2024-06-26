const Planet = require('../models/Planet');
const Research = require('../models/Research');
const { calculateBuildingTime, calculateResourceProduction } = require('../utils/gameLogic');
const { allocateResources, updateResources } = require('../utils/planetUtils');

exports.getBuildings = async (req, res) => {
    try {
        const planet = await Planet.findOne({ userId: req.user.id });
        if (!planet) {
            return res.status(404).json({ message: 'Planet not found' });
        }
        res.json(planet.buildings);
    } catch (error) {
        console.error('Error in getBuildings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.upgradeBuilding = async (req, res) => {
    const { planetId, buildingType } = req.body;

    try {
        const planet = await Planet.findOne({ _id: planetId, userId: req.user.id });
        if (!planet) {
            return res.status(404).json({ message: 'Planet not found' });
        }

        const research = await Research.findOne({ userId: req.user.id });

        // Update resources before proceeding
        const now = new Date();
        const timeDiff = (now - planet.lastResourceUpdate) / 3600000; // time difference in hours
        const productionRates = {
            metal: calculateResourceProduction(planet.buildings.metalMine, research.metalResearch),
            crystal: calculateResourceProduction(planet.buildings.crystalMine, research.crystalResearch),
            deuterium: calculateResourceProduction(planet.buildings.deuteriumMine, research.deuteriumResearch)
        };
        updateResources(planet, timeDiff, productionRates);

        const currentLevel = planet.buildings[buildingType];
        const upgradeCost = calculateUpgradeCost(buildingType, currentLevel);
        const buildTime = calculateBuildingTime(currentLevel, buildingType);

        if (!allocateResources(planet, 'metal', upgradeCost.metal) ||
            !allocateResources(planet, 'crystal', upgradeCost.crystal) ||
            !allocateResources(planet, 'deuterium', upgradeCost.deuterium)) {
            return res.status(400).json({ message: 'Insufficient resources' });
        }

        // Schedule the upgrade completion
        planet.buildingQueue.push({
            type: buildingType,
            completionTime: new Date(Date.now() + buildTime * 1000)
        });

        await planet.save();

        res.json({ message: 'Building upgrade started', completionTime: new Date(Date.now() + buildTime * 1000) });
    } catch (error) {
        console.error('Error in upgradeBuilding:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateUpgradeCost(buildingType, currentLevel) {
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