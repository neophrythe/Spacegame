const gameConfig = require('../config/gameConfig');
const logger = require('../utils/logger');

const validateResources = (resources) => {
    if (!resources || typeof resources !== 'object') {
        return false;
    }

    const values = Object.values(resources);
    return values.every(value => typeof value === 'number' && value >= 0);
};

const antiCheatMiddleware = (req, res, next) => {
    if (!req.user) {
        logger.warn('Unauthorized access attempt detected');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;

    if (req.path.startsWith('/api/resources') && req.body.resources) {
        if (!validateResources(req.body.resources)) {
            logger.warn('Invalid resource values detected', { userId, resources: req.body.resources });
            return res.status(400).json({ message: 'Invalid resource values detected' });
        }
    }

    const validateFleetMovement = (origin, destination, ships) => {
        const maxDistance = 5000;
        const distance = Math.sqrt(
            Math.pow(destination.galaxy - origin.galaxy, 2) +
            Math.pow(destination.system - origin.system, 2) +
            Math.pow(destination.position - origin.position, 2)
        );
        return distance <= maxDistance && Object.values(ships).some(count => count > 0);
    };

    const validateShipBuild = (shipType, amount) => {
        if (!gameConfig.ships[shipType]) {
            return false;
        }
        const maxBuildAmount = 1000;
        return amount > 0 && amount <= maxBuildAmount;
    };

    if (req.path === '/api/fleet/move') {
        if (!validateFleetMovement(req.body.origin, req.body.destination, req.body.ships)) {
            logger.warn('Invalid fleet movement detected', { userId, movement: req.body });
            return res.status(400).json({ message: 'Invalid fleet movement detected' });
        }
    }

    if (req.path === '/api/fleet/build') {
        if (!validateShipBuild(req.body.shipType, req.body.amount)) {
            logger.warn('Invalid ship build request', { userId, shipType: req.body.shipType, amount: req.body.amount });
            return res.status(400).json({ message: 'Invalid ship build request' });
        }
    }

    next();
};

module.exports = antiCheatMiddleware;
