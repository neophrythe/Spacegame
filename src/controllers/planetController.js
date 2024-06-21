const Planet = require('../models/Planet');
const Research = require('../models/Research');
const User = require('../models/User');

exports.getPlanet = async (req, res) => {
    try {
        const planet = await Planet.findOne({ _id: req.params.id, userId: req.user.id });
        if (!planet) {
            return res.status(404).json({ message: 'Planet not found' });
        }
        res.json(planet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllPlanets = async (req, res) => {
    try {
        const planets = await Planet.find({ userId: req.user.id });
        res.json(planets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.abandonPlanet = async (req, res) => {
    try {
        const { planetId } = req.body;
        const planet = await Planet.findOne({ _id: planetId, userId: req.user.id });

        if (!planet) {
            return res.status(404).json({ message: 'Planet not found or doesn\'t belong to you' });
        }

        // Reset the planet
        planet.userId = null;
        planet.buildings = {};
        planet.resources = { metal: 0, crystal: 0, deuterium: 0 };
        await planet.save();

        res.json({ message: 'Planet abandoned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getColonizationLimit = async (req, res) => {
    try {
        const research = await Research.findOne({ userId: req.user.id });
        const maxPlanets = research.getMaxPlanets();
        const currentPlanets = await Planet.countDocuments({ userId: req.user.id });

        res.json({ maxPlanets, currentPlanets });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};