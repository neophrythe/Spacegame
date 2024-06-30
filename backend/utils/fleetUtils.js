const { calculateFlightTime, calculateGalaxyDistance, calculateSystemDistance, calculatePlanetDistance } = require('./gameLogic');
const FleetMovement = require('../models/FleetMovement');
const { simulateCombat } = require('./combatUtils');
const Planet = require('../models/Planet');
const Fleet = require('../models/Fleet');
const { createNotification } = require('../controllers/notificationController');

const calculateTotalFlightTime = (start, destination, ships) => {
    const galaxyDistance = calculateGalaxyDistance(start.galaxy, destination.galaxy);
    const systemDistance = calculateSystemDistance(start.system, destination.system);
    const planetDistance = calculatePlanetDistance(start.planet, destination.planet);
    const totalDistance = galaxyDistance + systemDistance + planetDistance;

    // Calculate the speed of the slowest ship
    const slowestSpeed = Math.min(...Object.keys(ships).map(shipType => gameBalance.ships[shipType].speed));

    return calculateFlightTime(totalDistance, slowestSpeed);
};

const manageFleetComposition = (fleet, action, shipType, amount) => {
    if (action === 'add') {
        fleet[shipType] = (fleet[shipType] || 0) + amount;
    } else if (action === 'remove' && fleet[shipType]) {
        fleet[shipType] = Math.max(0, fleet[shipType] - amount);
    }
    return fleet;
};

const resolveFleetMovements = async () => {
    const now = new Date();
    const arrivedFleets = await FleetMovement.find({ arrivalTime: { $lte: now } });

    for (let fleet of arrivedFleets) {
        switch (fleet.mission) {
            case 'attack':
                await resolveAttack(fleet);
                break;
            case 'transport':
                await resolveTransport(fleet);
                break;
            case 'colonize':
                await resolveColonization(fleet);
                break;
        }

        await FleetMovement.deleteOne({ _id: fleet._id });
    }
};

const resolveAttack = async (fleet) => {
    const originPlanet = await Planet.findById(fleet.originPlanetId);
    const targetPlanet = await Planet.findById(fleet.destinationPlanetId);
    const attackerFleet = await Fleet.findOne({ userId: fleet.userId });
    const defenderFleet = await Fleet.findOne({ userId: targetPlanet.userId });

    const combatResult = await simulateCombat(fleet.ships, defenderFleet, originPlanet, targetPlanet);

    // Update fleets and resources based on combat result
    updateFleetsAfterCombat(attackerFleet, defenderFleet, combatResult);
    updateResourcesAfterCombat(originPlanet, targetPlanet, combatResult);

    // Send notifications
    await createNotification(fleet.userId, 'combat_result', `Your attack on ${targetPlanet.name} has ${combatResult.attackerWins ? 'succeeded' : 'failed'}.`);
    await createNotification(targetPlanet.userId, 'under_attack', `Your planet ${targetPlanet.name} was attacked!`);

    await Promise.all([attackerFleet.save(), defenderFleet.save(), originPlanet.save(), targetPlanet.save()]);
};

const resolveTransport = async (fleet) => {
    const destinationPlanet = await Planet.findById(fleet.destinationPlanetId);

    // Transfer resources
    Object.keys(fleet.resources).forEach(resourceType => {
        destinationPlanet.resources[resourceType] += fleet.resources[resourceType];
    });

    // Return ships to origin planet
    const originFleet = await Fleet.findOne({ userId: fleet.userId });
    Object.keys(fleet.ships).forEach(shipType => {
        originFleet[shipType] += fleet.ships[shipType];
    });

    await Promise.all([destinationPlanet.save(), originFleet.save()]);

    await createNotification(fleet.userId, 'transport_complete', `Your transport to ${destinationPlanet.name} has been completed.`);
};

const resolveColonization = async (fleet) => {
    const targetPlanet = await Planet.findById(fleet.destinationPlanetId);

    if (targetPlanet.userId) {
        // Planet is already colonized, return fleet
        const originFleet = await Fleet.findOne({ userId: fleet.userId });
        Object.keys(fleet.ships).forEach(shipType => {
            originFleet[shipType] += fleet.ships[shipType];
        });
        await originFleet.save();
        await createNotification(fleet.userId, 'colonization_failed', `Colonization of ${targetPlanet.name} failed. The planet is already inhabited.`);
    } else {
        // Colonize the planet
        targetPlanet.userId = fleet.userId;
        targetPlanet.buildings = {
            metalMine: 1,
            crystalMine: 1,
            deuteriumMine: 1,
            solarPlant: 1,
            robotFactory: 1,
            shipyard: 1,
        };
        targetPlanet.resources = {
            metal: 500,
            crystal: 300,
            deuterium: 100,
        };
        await targetPlanet.save();
        await createNotification(fleet.userId, 'colonization_success', `You have successfully colonized ${targetPlanet.name}!`);
    }
};

function updateFleetsAfterCombat(attackerFleet, defenderFleet, combatResult) {
    Object.keys(combatResult.survivingAttackerFleet).forEach(shipType => {
        attackerFleet[shipType] += combatResult.survivingAttackerFleet[shipType];
    });
    Object.keys(combatResult.survivingDefenderFleet).forEach(shipType => {
        defenderFleet[shipType] = combatResult.survivingDefenderFleet[shipType];
    });
}

function updateResourcesAfterCombat(originPlanet, targetPlanet, combatResult) {
    if (combatResult.attackerWins) {
        Object.keys(combatResult.resourcesLooted).forEach(resourceType => {
            originPlanet.resources[resourceType] += combatResult.resourcesLooted[resourceType];
            targetPlanet.resources[resourceType] -= combatResult.resourcesLooted[resourceType];
        });
    }
}

module.exports = {
    calculateTotalFlightTime,
    manageFleetComposition,
    resolveFleetMovements
};