const Planet = require('../models/Planet');
const User = require('../models/User');
const System = require('../models/System'); // Add this line
const Galaxy = require('../models/Galaxy');
const { calculateResourceProduction } = require('../utils/gameLogic');
const logger = require('../utils/logger');

exports.getResources = async (req, res) => {
    try {
        let planet = await Planet.findOne({ userId: req.user.id });
        if (!planet) {
            const user = await User.findById(req.user.id);

            // Create a new galaxy or get an existing one
            let galaxy = await Galaxy.findOne({ isFull: false }).sort('id');
            if (!galaxy) {
                galaxy = new Galaxy({ id: 1 });
                await galaxy.save();
            }

            // Create a new system or get an existing one
            let system = await System.findOne({ galaxyId: galaxy._id, planets: { $size: { $lt: 15 } } });
            if (!system) {
                system = new System({
                    galaxyId: galaxy._id,
                    id: galaxy.systems.length + 1,
                    planets: []
                });
                galaxy.systems.push(system._id);
                await galaxy.save();
            }

            planet = new Planet({
                userId: user._id,
                name: `${user.username}'s Planet`,
                resources: { metal: 500, crystal: 300, deuterium: 100 },
                buildings: { metalMine: 1, crystalMine: 1, deuteriumMine: 1 },
                lastResourceUpdate: new Date(),
                systemId: system._id,
                position: system.planets.length + 1
            });
            await planet.save();

            system.planets.push(planet._id);
            await system.save();
        }

        const now = new Date();
        const timeDiff = (now - planet.lastResourceUpdate) / 3600000; // time difference in hours
        const production = calculateResourceProduction(planet);

        const updatedResources = {
            metal: Math.floor(planet.resources.metal + production.metal * timeDiff),
            crystal: Math.floor(planet.resources.crystal + production.crystal * timeDiff),
            deuterium: Math.floor(planet.resources.deuterium + production.deuterium * timeDiff),
            energy: production.energy // Energy is not stored, just show current production
        };

        planet.resources = updatedResources;
        planet.lastResourceUpdate = now;
        await planet.save();

        res.json({
            resources: updatedResources,
            buildings: planet.buildings
        });
    } catch (error) {
        logger.error('Error in getResources:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateResources = async (req, res) => {
    try {
        const { planetId, resources } = req.body;
        const planet = await Planet.findOne({ _id: planetId, userId: req.user.id });

        if (!planet) {
            return res.status(404).json({ message: 'Planet not found' });
        }

        if (!validateResources(resources)) {
            return res.status(400).json({ message: 'Invalid resource amounts' });
        }

        planet.resources = {
            ...planet.resources,
            ...resources
        };

        planet.lastResourceUpdate = new Date();
        await planet.save();

        res.json({ message: 'Resources updated successfully', resources: planet.resources });
    } catch (error) {
        logger.error('Error in updateResources:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function validateResources(resources) {
    return Object.values(resources).every(amount => amount >= 0);
}