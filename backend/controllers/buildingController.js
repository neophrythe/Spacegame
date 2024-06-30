const Planet = require('../models/Planet');
const { buildingQueue } = require('../utils/queue');
const gameConfig = require('../config/gameConfig');

exports.getBuildings = async (req, res) => {
    try {
        const planet = await Planet.findOne({ userId: req.user.id });
        if (!planet) {
            return res.status(404).json({ message: 'Planet not found' });
        }
        res.json(planet.buildings);
    } catch (error) {
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

        const currentLevel = planet.buildings[buildingType] || 0;
        const upgradeCost = calculateUpgradeCost(buildingType, currentLevel);

        // Check if planet has enough resources
        if (!hasEnoughResources(planet.resources, upgradeCost)) {
            return res.status(400).json({ message: 'Not enough resources' });
        }

        // Deduct resources
        planet.resources = subtractResources(planet.resources, upgradeCost);

        // Calculate build time
        const buildTime = calculateBuildTime(buildingType, currentLevel);

        // Add to building queue
        await buildingQueue.add({
            planetId: planet._id,
            building: {
                type: buildingType,
                level: currentLevel + 1,
                completionTime: new Date(Date.now() + buildTime * 1000)
            }
        });

        await planet.save();

        res.json({
            message: 'Building upgrade started',
            completionTime: new Date(Date.now() + buildTime * 1000)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateUpgradeCost(buildingType, currentLevel) {
    const baseCost = gameConfig.buildings[buildingType].cost;
    const factor = gameConfig.buildings[buildingType].factor;

    return {
        metal: Math.floor(baseCost.metal * Math.pow(factor, currentLevel)),
        crystal: Math.floor(baseCost.crystal * Math.pow(factor, currentLevel)),
        deuterium: Math.floor((baseCost.deuterium || 0) * Math.pow(factor, currentLevel))
    };
}

function hasEnoughResources(planetResources, cost) {
    return planetResources.metal >= cost.metal &&
        planetResources.crystal >= cost.crystal &&
        planetResources.deuterium >= (cost.deuterium || 0);
}

function subtractResources(planetResources, cost) {
    return {
        metal: planetResources.metal - cost.metal,
        crystal: planetResources.crystal - cost.crystal,
        deuterium: planetResources.deuterium - (cost.deuterium || 0)
    };
}

function calculateBuildTime(buildingType, level) {
    const baseCost = gameConfig.buildings[buildingType].cost;
    return Math.floor((baseCost.metal + baseCost.crystal) / 2500 * (1 + level) * Math.pow(0.95, level));
}