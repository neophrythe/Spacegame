const Fleet = require('../models/Fleet');
const Planet = require('../models/Planet');
const User = require('../models/User');
const FleetMovement = require('../models/FleetMovement');
const { calculateFlightTime, simulateCombat } = require('../gameLogic');
const { createNotification } = require('./notificationController');

exports.getFleet = async (req, res) => {
    try {
        const fleet = await Fleet.findOne({ userId: req.user.id });
        res.json(fleet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.buildShip = async (req, res) => {
    const { shipType, amount } = req.body;
    try {
        const fleet = await Fleet.findOne({ userId: req.user.id });
        if (fleet) {
            if (shipType === 'spyDrones') {
                // Check if player has necessary research level for spy drones
                const research = await Research.findOne({ userId: req.user.id });
                if (research.espionage < 1) {
                    return res.status(400).json({ message: 'Espionage research required to build spy drones' });
                }
            }
            fleet[shipType] += amount;
            await fleet.save();
            res.json(fleet);
        } else {
            res.status(404).json({ error: 'Fleet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.sendFleet = async (req, res) => {
    const { originPlanetId, destinationPlanetId, ships, resources } = req.body;

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
        if (originPlanet.userId.toString() !== destinationPlanet.userId.toString()) {
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

        // Create a new fleet movement
        const fleetMovement = new FleetMovement({
            userId: req.user.id,
            originPlanetId,
            destinationPlanetId,
            ships,
            resources,
            startTime: Date.now(),
            arrivalTime: Date.now() + flightTime * 1000,
        });
        await fleetMovement.save();

        // Schedule fleet arrival notification
        setTimeout(async () => {
            await createNotification(req.user.id, 'fleet_arrived', `Your fleet has arrived at the destination.`);
        }, flightTime * 1000);

        res.json({ message: 'Fleet dispatched', arrivalTime: fleetMovement.arrivalTime });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.attack = async (req, res) => {
    const { originPlanetId, targetPlanetId, ships } = req.body;

    try {
        const originPlanet = await Planet.findOne({ _id: originPlanetId, userId: req.user.id });
        const targetPlanet = await Planet.findById(targetPlanetId);
        const attackerFleet = await Fleet.findOne({ userId: req.user.id });
        const defenderFleet = await Fleet.findOne({ userId: targetPlanet.userId });

        if (!originPlanet || !targetPlanet || !attackerFleet || !defenderFleet) {
            return res.status(404).json({ message: 'Planet or fleet not found' });
        }

        // Check if attacker and defender are in the same clan
        const attacker = await User.findById(req.user.id);
        const defender = await User.findById(targetPlanet.userId);

        if (attacker.clan && defender.clan && attacker.clan.toString() === defender.clan.toString()) {
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

        // Schedule the attack
        setTimeout(async () => {
            const combatResult = simulateCombat(ships, defenderFleet, targetPlanet.buildings);

            if (combatResult.attackerWins) {
                // Update attacker's resources
                originPlanet.resources.metal += combatResult.resourcesLooted.metal;
                originPlanet.resources.crystal += combatResult.resourcesLooted.crystal;
                originPlanet.resources.deuterium += combatResult.resourcesLooted.deuterium;
                await originPlanet.save();

                // Update defender's resources
                targetPlanet.resources.metal -= combatResult.resourcesLooted.metal;
                targetPlanet.resources.crystal -= combatResult.resourcesLooted.crystal;
                targetPlanet.resources.deuterium -= combatResult.resourcesLooted.deuterium;
                await targetPlanet.save();

                // Notify the attacker
                await createNotification(req.user.id, 'attack_success', `Your attack on ${targetPlanet.name} was successful!`);

                // Notify the defender
                await createNotification(targetPlanet.userId, 'under_attack', `Your planet ${targetPlanet.name} was attacked!`);
            } else {
                // Notify the attacker
                await createNotification(req.user.id, 'attack_failed', `Your attack on ${targetPlanet.name} was repelled!`);

                // Notify the defender
                await createNotification(targetPlanet.userId, 'defense_success', `You successfully defended ${targetPlanet.name} from an attack!`);
            }

            // Update fleets
            Object.entries(combatResult.survivingAttackerFleet).forEach(([shipType, quantity]) => {
                attackerFleet[shipType] += quantity;
            });
            await attackerFleet.save();

            Object.entries(combatResult.survivingDefenderFleet).forEach(([shipType, quantity]) => {
                defenderFleet[shipType] = quantity;
            });
            await defenderFleet.save();

        }, flightTime * 1000);

        res.json({ message: 'Attack launched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.colonize = async (req, res) => {
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

        // Schedule colonization
        setTimeout(async () => {
            targetPlanet.userId = req.user.id;
            targetPlanet.buildings = {
                metalMine: 1,
                crystalMine: 1,
                deuteriumMine: 1,
                researchCenter: 0,
                shipyard: 0,
                ionCannon: 0,
                ionShield: 0
            };
            targetPlanet.resources = {
                metal: 500,
                crystal: 300,
                deuterium: 100
            };
            await targetPlanet.save();

            await createNotification(req.user.id, 'colonization_success', `You successfully colonized a new planet!`);
        }, flightTime * 1000);

        res.json({ message: 'Colonization mission launched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.checkFleetMovements = async () => {
    const now = Date.now();
    const arrivedFleets = await FleetMovement.find({ arrivalTime: { $lte: now } });

    for (const fleetMovement of arrivedFleets) {
        const { userId, originPlanetId, destinationPlanetId, ships, resources, mission } = fleetMovement;

        const originPlanet = await Planet.findById(originPlanetId);
        const destinationPlanet = await Planet.findById(destinationPlanetId);
        const userFleet = await Fleet.findOne({ userId });

        switch (mission) {
            case 'attack':
                await handleAttack(userId, originPlanet, destinationPlanet, ships);
                break;
            case 'colonize':
                await handleColonization(userId, destinationPlanet, ships);
                break;
            case 'transfer':
                await handleResourceTransfer(userId, destinationPlanet, resources);
                break;
            default:
                console.error(`Unknown mission type: ${mission}`);
        }

        // Return ships to user's fleet
        for (const [shipType, quantity] of Object.entries(ships)) {
            userFleet[shipType] += quantity;
        }
        await userFleet.save();

        // Remove the fleet movement
        await FleetMovement.findByIdAndRemove(fleetMovement._id);
    }
};

async function handleAttack(attackerId, originPlanet, targetPlanet, attackerShips) {
    const defender = await User.findById(targetPlanet.userId);
    const defenderFleet = await Fleet.findOne({ userId: defender._id });

    const combatResult = simulateCombat(attackerShips, defenderFleet, targetPlanet.buildings);

    if (combatResult.attackerWins) {
        // Update attacker's resources
        originPlanet.resources.metal += combatResult.resourcesLooted.metal;
        originPlanet.resources.crystal += combatResult.resourcesLooted.crystal;
        originPlanet.resources.deuterium += combatResult.resourcesLooted.deuterium;
        await originPlanet.save();

        // Update defender's resources
        targetPlanet.resources.metal -= combatResult.resourcesLooted.metal;
        targetPlanet.resources.crystal -= combatResult.resourcesLooted.crystal;
        targetPlanet.resources.deuterium -= combatResult.resourcesLooted.deuterium;
        await targetPlanet.save();

        // Update defender's fleet
        for (const [shipType, quantity] of Object.entries(combatResult.survivingDefenderFleet)) {
            defenderFleet[shipType] = quantity;
        }
        await defenderFleet.save();

        // Notify players
        await createNotification(attackerId, 'attack_success', `Your attack on ${targetPlanet.name} was successful!`);
        await createNotification(defender._id, 'under_attack', `Your planet ${targetPlanet.name} was attacked!`);
    } else {
        // Notify players
        await createNotification(attackerId, 'attack_failed', `Your attack on ${targetPlanet.name} was repelled!`);
        await createNotification(defender._id, 'defense_success', `You successfully defended ${targetPlanet.name} from an attack!`);
    }
}

async function handleColonization(userId, targetPlanet, ships) {
    if (ships.colony && ships.colony > 0 && !targetPlanet.userId) {
        targetPlanet.userId = userId;
        targetPlanet.buildings = {
            metalMine: 1,
            crystalMine: 1,
            deuteriumMine: 1,
            researchCenter: 0,
            shipyard: 0,
            ionCannon: 0,
            ionShield: 0
        };
        targetPlanet.resources = {
            metal: 500,
            crystal: 300,
            deuterium: 100
        };
        await targetPlanet.save();

        await createNotification(userId, 'colonization_success', `You successfully colonized a new planet!`);
    } else {
        await createNotification(userId, 'colonization_failed', `Colonization failed. The planet might already be colonized or you didn't send a colony ship.`);
    }
}

async function handleResourceTransfer(userId, destinationPlanet, resources) {
    // Add resources to the destination planet
    for (const [resourceType, amount] of Object.entries(resources)) {
        destinationPlanet.resources[resourceType] += amount;
    }
    await destinationPlanet.save();

    // Notify the player
    await createNotification(userId, 'transfer_complete', `Resource transfer to ${destinationPlanet.name} completed successfully.`);
}

function getShipSpeed(shipType) {
    const shipSpeeds = {
        'raven': 10000,
        'marauder': 7500,
        'vandal': 5000,
        'stinger': 12500,
        'brawler': 8000,
        'devastator': 4000,
        'sentinel': 6000,
        'fortress': 3000,
        'transport': 5000,
        'colony': 2500
    };
    return shipSpeeds[shipType] || 0;
}

module.exports = {
    getFleet,
    buildShip,
    sendFleet,
    attack,
    colonize,
    checkFleetMovements,
    getShipSpeed
};