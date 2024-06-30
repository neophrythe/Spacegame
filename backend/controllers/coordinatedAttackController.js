const CoordinatedAttack = require('../models/CoordinatedAttack');
const Planet = require('../models/Planet');
const { calculateFlightTime } = require('../utils/gameLogic');
const gameConfig = require('../config/gameConfig');
const { v4: uuidv4 } = require('uuid');

exports.createCoordinatedAttack = async (req, res) => {
    try {
        const { targetPlanetId, fleet, speedPercentage } = req.body;
        const attackCode = uuidv4().slice(0, 8);

        const originPlanet = await Planet.findOne({ userId: req.user.id });
        const targetPlanet = await Planet.findById(targetPlanetId);

        if (!originPlanet || !targetPlanet) {
            return res.status(404).json({ message: 'Origin or target planet not found' });
        }

        const flightTime = calculateFlightTime(originPlanet, targetPlanet, gameConfig) * (100 / speedPercentage);
        const arrivalTime = new Date(Date.now() + flightTime * 1000);

        const coordinatedAttack = new CoordinatedAttack({
            attackCode,
            initiator: req.user.id,
            targetPlanet: targetPlanetId,
            arrivalTime,
            participants: [{
                user: req.user.id,
                fleet,
                speedPercentage
            }]
        });

        await coordinatedAttack.save();

        res.status(201).json({
            message: 'Coordinated attack created',
            attackCode,
            arrivalTime
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating coordinated attack', error: error.message });
    }
};

exports.joinCoordinatedAttack = async (req, res) => {
    try {
        const { attackCode, fleet, speedPercentage } = req.body;

        const coordinatedAttack = await CoordinatedAttack.findOne({ attackCode });

        if (!coordinatedAttack) {
            return res.status(404).json({ message: 'Coordinated attack not found' });
        }

        if (coordinatedAttack.status !== 'pending') {
            return res.status(400).json({ message: 'This attack is no longer accepting participants' });
        }

        const originPlanet = await Planet.findOne({ userId: req.user.id });
        const targetPlanet = await Planet.findById(coordinatedAttack.targetPlanet);

        const flightTime = calculateFlightTime(originPlanet, targetPlanet, gameConfig) * (100 / speedPercentage);
        const arrivalTime = new Date(Date.now() + flightTime * 1000);

        if (arrivalTime > coordinatedAttack.arrivalTime) {
            return res.status(400).json({ message: 'Your fleet would arrive too late for this attack' });
        }

        coordinatedAttack.participants.push({
            user: req.user.id,
            fleet,
            speedPercentage
        });

        await coordinatedAttack.save();

        res.json({
            message: 'Successfully joined the coordinated attack',
            arrivalTime: coordinatedAttack.arrivalTime
        });
    } catch (error) {
        res.status(500).json({ message: 'Error joining coordinated attack', error: error.message });
    }
};

exports.getCoordinatedAttack = async (req, res) => {
    try {
        const { attackCode } = req.params;
        const coordinatedAttack = await CoordinatedAttack.findOne({ attackCode })
            .populate('initiator', 'username')
            .populate('targetPlanet', 'name')
            .populate('participants.user', 'username');

        if (!coordinatedAttack) {
            return res.status(404).json({ message: 'Coordinated attack not found' });
        }

        res.json(coordinatedAttack);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coordinated attack', error: error.message });
    }
};

exports.listCoordinatedAttacks = async (req, res) => {
    try {
        const coordinatedAttacks = await CoordinatedAttack.find({
            $or: [
                { initiator: req.user.id },
                { 'participants.user': req.user.id }
            ]
        })
            .populate('initiator', 'username')
            .populate('targetPlanet', 'name')
            .sort('-createdAt');

        res.json(coordinatedAttacks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coordinated attacks', error: error.message });
    }
};

exports.cancelCoordinatedAttack = async (req, res) => {
    try {
        const { attackCode } = req.params;
        const coordinatedAttack = await CoordinatedAttack.findOne({ attackCode });

        if (!coordinatedAttack) {
            return res.status(404).json({ message: 'Coordinated attack not found' });
        }

        if (coordinatedAttack.initiator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the initiator can cancel the attack' });
        }

        if (coordinatedAttack.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot cancel an attack that is not pending' });
        }

        await CoordinatedAttack.deleteOne({ _id: coordinatedAttack._id });

        res.json({ message: 'Coordinated attack cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling coordinated attack', error: error.message });
    }
};