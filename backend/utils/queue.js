const Queue = require('bull');
const logger = require('./logger');
const Planet = require('../models/Planet');
const Research = require('../models/Research');
const FleetMovement = require('../models/FleetMovement');
const User = require('../models/User');
const gameConfig = require('../config/gameConfig');
const { simulateCombat } = require('./combatLogic');
const { createNotification } = require('../controllers/notificationController');

// Create queues
const buildingQueue = new Queue('building-queue');
const researchQueue = new Queue('research-queue');
const fleetMovementQueue = new Queue('fleet-movement-queue');

// Process building queue
buildingQueue.process(async (job) => {
    const { planetId, building } = job.data;
    logger.info(`Processing building job for planet ${planetId}`, { building });

    try {
        const planet = await Planet.findById(planetId);
        if (!planet) {
            throw new Error('Planet not found');
        }

        // Update building level
        planet.buildings[building.type] += 1;

        // Remove the completed building from the queue
        planet.buildingQueue.shift();

        // Update planet resources (production boost from new building level)
        const productionIncrease = calculateProductionIncrease(building.type, planet.buildings[building.type]);
        planet.resources[getResourceTypeForBuilding(building.type)] += productionIncrease;

        await planet.save();

        // Notify user
        const user = await User.findById(planet.userId);
        await createNotification(user._id, 'building_complete', `Your ${building.type} on planet ${planet.name} has been upgraded to level ${planet.buildings[building.type]}`);

        logger.info(`Building ${building.type} completed on planet ${planetId}`);
    } catch (error) {
        logger.error('Error processing building job:', error);
        throw error;
    }
});

// Process research queue
researchQueue.process(async (job) => {
    const { researchId, research } = job.data;
    logger.info(`Processing research job for research ${researchId}`, { research });

    try {
        const researchDoc = await Research.findById(researchId);
        if (!researchDoc) {
            throw new Error('Research not found');
        }

        // Update research level
        researchDoc[research.type] += 1;

        // Remove the completed research from the queue
        researchDoc.researchQueue.shift();

        await researchDoc.save();

        // Notify user
        const user = await User.findById(researchDoc.userId);
        await createNotification(user._id, 'research_complete', `Your ${research.type} research has been upgraded to level ${researchDoc[research.type]}`);

        logger.info(`Research ${research.type} completed for user ${researchDoc.userId}`);
    } catch (error) {
        logger.error('Error processing research job:', error);
        throw error;
    }
});

// Process fleet movement queue
fleetMovementQueue.process(async (job) => {
    const { movementId } = job.data;
    logger.info(`Processing fleet movement job for movement ${movementId}`);

    try {
        const movement = await FleetMovement.findById(movementId);
        if (!movement) {
            throw new Error('Fleet movement not found');
        }

        const originPlanet = await Planet.findById(movement.originPlanetId);
        const destinationPlanet = await Planet.findById(movement.destinationPlanetId);

        if (!originPlanet || !destinationPlanet) {
            throw new Error('Origin or destination planet not found');
        }

        switch (movement.mission) {
            case 'attack':
                await resolveAttack(movement, originPlanet, destinationPlanet);
                break;
            case 'transport':
                await resolveTransport(movement, originPlanet, destinationPlanet);
                break;
            case 'colonize':
                await resolveColonization(movement, originPlanet, destinationPlanet);
                break;
            default:
                logger.warn(`Unknown mission type: ${movement.mission}`);
        }

        // Remove the completed movement
        await FleetMovement.findByIdAndDelete(movementId);

        logger.info(`Fleet movement ${movementId} resolved`);
    } catch (error) {
        logger.error('Error processing fleet movement job:', error);
        throw error;
    }
});

async function resolveAttack(movement, originPlanet, destinationPlanet) {
    const attackerResearch = await Research.findOne({ userId: movement.userId });
    const defenderResearch = await Research.findOne({ userId: destinationPlanet.userId });

    const combatResult = simulateCombat(movement.ships, destinationPlanet.ships, attackerResearch, defenderResearch);

    if (combatResult.attackerWins) {
        // Update resources on both planets
        originPlanet.resources = addResources(originPlanet.resources, combatResult.resourcesLooted);
        destinationPlanet.resources = subtractResources(destinationPlanet.resources, combatResult.resourcesLooted);

        // Update ships on origin planet
        originPlanet.ships = combatResult.survivingAttackerFleet;

        // Update ships on destination planet
        destinationPlanet.ships = combatResult.survivingDefenderFleet;

        await Promise.all([originPlanet.save(), destinationPlanet.save()]);

        // Notify users
        await createNotification(movement.userId, 'attack_success', `Your attack on ${destinationPlanet.name} was successful!`);
        await createNotification(destinationPlanet.userId, 'under_attack', `Your planet ${destinationPlanet.name} was attacked!`);
    } else {
        // Update ships on origin planet (returning fleet)
        originPlanet.ships = addFleets(originPlanet.ships, combatResult.survivingAttackerFleet);
        await originPlanet.save();

        // Notify users
        await createNotification(movement.userId, 'attack_failed', `Your attack on ${destinationPlanet.name} was repelled!`);
        await createNotification(destinationPlanet.userId, 'defense_success', `You successfully defended ${destinationPlanet.name} from an attack!`);
    }
}

async function resolveTransport(movement, originPlanet, destinationPlanet) {
    // Transfer resources
    destinationPlanet.resources = addResources(destinationPlanet.resources, movement.resources);

    // Return ships to origin planet
    originPlanet.ships = addFleets(originPlanet.ships, movement.ships);

    await Promise.all([originPlanet.save(), destinationPlanet.save()]);

    // Notify users
    await createNotification(movement.userId, 'transport_complete', `Your transport to ${destinationPlanet.name} has been completed.`);
    if (originPlanet.userId !== destinationPlanet.userId) {
        await createNotification(destinationPlanet.userId, 'resources_received', `You received a resource transport on ${destinationPlanet.name}.`);
    }
}

async function resolveColonization(movement, originPlanet, destinationPlanet) {
    if (destinationPlanet.userId) {
        // Planet is already colonized, return fleet
        originPlanet.ships = addFleets(originPlanet.ships, movement.ships);
        await originPlanet.save();
        await createNotification(movement.userId, 'colonization_failed', `Colonization of ${destinationPlanet.name} failed. The planet is already inhabited.`);
    } else {
        // Colonize the planet
        destinationPlanet.userId = movement.userId;
        destinationPlanet.ships = movement.ships;
        destinationPlanet.buildings = {
            metalMine: 1,
            crystalMine: 1,
            deuteriumMine: 1,
            solarPlant: 1,
            robotFactory: 1,
            shipyard: 1,
        };
        destinationPlanet.resources = {
            metal: 500,
            crystal: 300,
            deuterium: 100,
        };

        await destinationPlanet.save();
        await createNotification(movement.userId, 'colonization_success', `You have successfully colonized ${destinationPlanet.name}!`);
    }
}

function calculateProductionIncrease(buildingType, level) {
    const baseProduction = gameConfig.resources.baseProduction[getResourceTypeForBuilding(buildingType)];
    return Math.floor(baseProduction * (Math.pow(gameConfig.resources.productionFactor, level) - Math.pow(gameConfig.resources.productionFactor, level - 1)));
}

function getResourceTypeForBuilding(buildingType) {
    switch (buildingType) {
        case 'metalMine':
            return 'metal';
        case 'crystalMine':
            return 'crystal';
        case 'deuteriumMine':
            return 'deuterium';
        default:
            return null;
    }
}

function addResources(resources1, resources2) {
    return {
        metal: resources1.metal + resources2.metal,
        crystal: resources1.crystal + resources2.crystal,
        deuterium: resources1.deuterium + resources2.deuterium,
    };
}

function subtractResources(resources1, resources2) {
    return {
        metal: Math.max(0, resources1.metal - resources2.metal),
        crystal: Math.max(0, resources1.crystal - resources2.crystal),
        deuterium: Math.max(0, resources1.deuterium - resources2.deuterium),
    };
}

function addFleets(fleet1, fleet2) {
    const result = { ...fleet1 };
    for (const shipType in fleet2) {
        if (result[shipType]) {
            result[shipType] += fleet2[shipType];
        } else {
            result[shipType] = fleet2[shipType];
        }
    }
    return result;
}

module.exports = {
    buildingQueue,
    researchQueue,
    fleetMovementQueue
};