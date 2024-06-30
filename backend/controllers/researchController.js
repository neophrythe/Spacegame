const Research = require('../models/Research');
const User = require('../models/User');
const Planet = require('../models/Planet');
const { researchQueue } = require('../utils/queue');
const gameConfig = require('../config/gameConfig');

exports.getResearch = async (req, res) => {
    try {
        const research = await Research.findOne({ userId: req.user.id });
        if (!research) {
            return res.status(404).json({ message: 'Research not found' });
        }
        res.json(research);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.upgradeResearch = async (req, res) => {
    const { researchType } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const research = await Research.findOne({ userId: req.user.id });
        const planet = await Planet.findOne({ userId: req.user.id, isMainPlanet: true });

        if (!research || !planet) {
            return res.status(404).json({ message: 'Research or main planet not found' });
        }

        const currentLevel = research[researchType] || 0;
        const upgradeCost = calculateResearchCost(researchType, currentLevel);

        // Check if planet has enough resources
        if (!hasEnoughResources(planet.resources, upgradeCost)) {
            return res.status(400).json({ message: 'Not enough resources' });
        }

        // Deduct resources
        planet.resources = subtractResources(planet.resources, upgradeCost);

        // Calculate research time
        const researchTime = calculateResearchTime(researchType, currentLevel);

        // Add to research queue
        await researchQueue.add({
            userId: user._id,
            research: {
                type: researchType,
                level: currentLevel + 1,
                completionTime: new Date(Date.now() + researchTime * 1000)
            }
        });

        await planet.save();

        res.json({
            message: 'Research upgrade started',
            completionTime: new Date(Date.now() + researchTime * 1000)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateResearchCost(researchType, currentLevel) {
    const baseCost = gameConfig.research[researchType].cost;
    const factor = gameConfig.research[researchType].factor;

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

function calculateResearchTime(researchType, level) {
    const baseCost = gameConfig.research[researchType].cost;
    return Math.floor((baseCost.metal + baseCost.crystal) / 1000 * (1 + level) * Math.pow(0.9, level));
}

module.exports = {
    getResearch,
    upgradeResearch
};