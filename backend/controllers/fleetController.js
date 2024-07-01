/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const Fleet = require('../models/Fleet');
const Planet = require('../models/Planet');
const User = require('../models/User');
const Research = require('../models/Research');
const Clan = require('../models/Clan');
const { fleetMovementQueue } = require('../utils/queue');
const { getShipCosts } = require('../utils/shipUtils');
const { calculateFlightTime, simulateCombat } = require('../utils/gameLogic');
const { createNotification } = require('./notificationController');
const { checkAchievement } = require('./achievementController');
const gameConfig = require('../config/gameConfig');

/**
 * Get the fleet for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getFleet = async (req, res) => {
    try {
        const fleet = await Fleet.findOne({ userId: req.user.id });
        if (!fleet) {
            return res.status(404).json({ message: 'Fleet not found' });
        }
        res.json(fleet);
    } catch (error) {
        console.error('Error in getFleet:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Build a ship for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const buildShip = async (req, res) => {
    const { planetId, shipType, amount } = req.body;
    try {
        const fleet = await Fleet.findOne({ userId: req.user.id });
        const research = await Research.findOne({ userId: req.user.id });
        const planet = await Planet.findById(planetId);

        if (!fleet || !research || !planet) {
            return res.status(404).json({ message: 'Required data not found' });
        }

        const shipCosts = getShipCosts(shipType);
        const totalCost = {
            metal: shipCosts.metal * amount,
            crystal: shipCosts.crystal * amount,
            deuterium: (shipCosts.deuterium || 0) * amount
        };

        // Check resources
        if (planet.resources.metal < totalCost.metal ||
            planet.resources.crystal < totalCost.crystal ||
            planet.resources.deuterium < totalCost.deuterium) {
            return res.status(400).json({ message: 'Insufficient resources' });
        }

        // Deduct resources
        planet.resources.metal -= totalCost.metal;
        planet.resources.crystal -= totalCost.crystal;
        planet.resources.deuterium -= totalCost.deuterium;

        // Queue ship building
        const buildTime = calculateBuildTime(shipType, amount);
        await fleetMovementQueue.add({
            type: 'buildShip',
            userId: req.user.id,
            planetId: planet._id,
            shipType,
            amount,
            completionTime: new Date(Date.now() + buildTime * 1000)
        });

        await planet.save();

        res.json({
            message: 'Ship building queued',
            completionTime: new Date(Date.now() + buildTime * 1000)
        });
    } catch (error) {
        console.error('Error in buildShip:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Send a fleet for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const sendFleet = async (req, res) => {
    const { originPlanetId, destinationPlanetId, ships, resources, mission } = req.body;

    try {
        const originPlanet = await Planet.findById(originPlanetId);
        const destinationPlanet = await Planet.findById(destinationPlanetId);
        const fleet = await Fleet.findOne({ userId: req.user.id });

        if (!originPlanet || !destinationPlanet || !fleet) {
            return res.status(404).json({ message: 'Planet or fleet not found' });
        }

        // Check if the user has enough ships
        for (const [shipType, quantity] of Object.entries(ships)) {
            if (fleet[shipType] < quantity) {
                return res.status(400).json({ message: `Not enough ${shipType}` });
            }
        }

        // Check if it's a resource transfer between different players
        if (mission === 'transfer' && originPlanet.userId.toString() !== destinationPlanet.userId.toString()) {
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(destinationPlanet.userId);

            if (!sender.clan || !receiver.clan || sender.clan.toString() !== receiver.clan.toString()) {
                return res.status(400).json({ message: 'You can only send resources to clan members' });
            }
        }

        const flightTime = calculateFlightTime(originPlanet, destinationPlanet);

        // Remove ships from the fleet
        for (const [shipType, quantity] of Object.entries(ships)) {
            fleet[shipType] -= quantity;
        }
        await fleet.save();

        // Remove resources from the origin planet
        for (const [resourceType, amount] of Object.entries(resources)) {
            if (originPlanet.resources[resourceType] < amount) {
                return res.status(400).json({ message: `Not enough ${resourceType} on the origin planet` });
            }
            originPlanet.resources[resourceType] -= amount;
        }
        await originPlanet.save();

        // Queue fleet movement
        await fleetMovementQueue.add({
            type: 'fleetMovement',
            userId: req.user.id,
            originPlanetId,
            destinationPlanetId,
            ships,
            resources,
            mission,
            startTime: Date.now(),
            arrivalTime: Date.now() + flightTime * 1000,
        });

        res.json({ message: 'Fleet dispatched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        console.error('Error in sendFleet:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Launch an attack for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const attack = async (req, res) => {
    const { originPlanetId, targetPlanetId, ships } = req.body;

    try {
        const originPlanet = await Planet.findOne({ _id: originPlanetId, userId: req.user.id });
        const targetPlanet = await Planet.findById(targetPlanetId);
        const attackerFleet = await Fleet.findOne({ userId: req.user.id });
        const attackerClan = await Clan.findOne({ members: req.user.id });
        const defenderClan = await Clan.findOne({ members: targetPlanet.userId });

        if (!originPlanet || !targetPlanet || !attackerFleet) {
            return res.status(404).json({ message: 'Planet or fleet not found' });
        }

        // Check if attacker and defender are in the same clan
        if (attackerClan && defenderClan && attackerClan._id.toString() === defenderClan._id.toString()) {
            return res.status(400).json({ message: 'You cannot attack members of your own clan' });
        }

        // Calculate flight time
        const flightTime = calculateFlightTime(originPlanet, targetPlanet);

        // Remove ships from the attacker's fleet
        for (const [shipType, quantity] of Object.entries(ships)) {
            if (attackerFleet[shipType] < quantity) {
                return res.status(400).json({ message: `Not enough ${shipType}` });
            }
            attackerFleet[shipType] -= quantity;
        }
        await attackerFleet.save();

        // Queue attack
        await fleetMovementQueue.add({
            type: 'attack',
            userId: req.user.id,
            originPlanetId,
            targetPlanetId,
            ships,
            startTime: Date.now(),
            arrivalTime: Date.now() + flightTime * 1000,
        });

        res.json({ message: 'Attack launched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        console.error('Error in attack:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Launch a colonization mission for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const colonize = async (req, res) => {
    const { originPlanetId, targetPlanetId, ships } = req.body;

    try {
        const originPlanet = await Planet.findOne({ _id: originPlanetId, userId: req.user.id });
        const targetPlanet = await Planet.findById(targetPlanetId);
        const fleet = await Fleet.findOne({ userId: req.user.id });

        if (!originPlanet || !targetPlanet || !fleet) {
            return res.status(404).json({ message: 'Planet or fleet not found' });
        }

        if (targetPlanet.userId) {
            return res.status(400).json({ message: 'Planet is already colonized' });
        }

        if (!ships.colony || ships.colony < 1) {
            return res.status(400).json({ message: 'You need at least one colony ship to colonize' });
        }

        // Calculate flight time
        const flightTime = calculateFlightTime(originPlanet, targetPlanet);

        // Remove colony ship from the fleet
        fleet.colony -= 1;
        await fleet.save();

        // Queue colonization
        await fleetMovementQueue.add({
            type: 'colonize',
            userId: req.user.id,
            originPlanetId,
            targetPlanetId,
            ships,
            startTime: Date.now(),
            arrivalTime: Date.now() + flightTime * 1000,
        });

        res.json({ message: 'Colonization mission launched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        console.error('Error in colonize:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Calculate build time for ships
 * @param {string} shipType - Type of ship to build
 * @param {number} amount - Number of ships to build
 * @returns {number} Build time in seconds
 */
function calculateBuildTime(shipType, amount) {
    const shipInfo = gameConfig.ships[shipType];
    if (!shipInfo) {
        throw new Error(`Invalid ship type: ${shipType}`);
    }
    const baseCost = shipInfo.cost.metal + shipInfo.cost.crystal + (shipInfo.cost.deuterium || 0);
    const baseTime = Math.sqrt(baseCost) * 10; // 10 seconds per sqrt of base cost
    return Math.floor(baseTime * amount);
}

module.exports = {
    getFleet,
    buildShip,
    sendFleet,
    attack,
    colonize
};