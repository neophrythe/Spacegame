const Fleet = require('../models/Fleet');
const Planet = require('../models/Planet');
const User = require('../models/User');
const FleetMovement = require('../models/FleetMovement');
const Research = require('../models/Research');
const { calculateFlightTime, simulateCombat } = require('../utils/gameLogic');
const { createNotification } = require('./notificationController');
const { checkAchievement } = require('./achievementController');

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

const buildShip = async (req, res) => {
    const { shipType, amount } = req.body;
    try {
        const fleet = await Fleet.findOne({ userId: req.user.id });
        const research = await Research.findOne({ userId: req.user.id });
        const planet = await Planet.findOne({ userId: req.user.id }); // Assuming the user's main planet

        if (!fleet || !research || !planet) {
            return res.status(404).json({ message: 'Required data not found' });
        }

        const shipCosts = getShipCosts(shipType);
        const totalCost = {
            metal: shipCosts.metal * amount,
            crystal: shipCosts.crystal * amount,
            deuterium: shipCosts.deuterium * amount
        };

        // Check resources
        if (planet.resources.metal < totalCost.metal ||
            planet.resources.crystal < totalCost.crystal ||
            planet.resources.deuterium < totalCost.deuterium) {
            return res.status(400).json({ message: 'Insufficient resources' });
        }

        // Check research requirements
        if (shipType === 'spyDrones' && research.espionage < 1) {
            return res.status(400).json({ message: 'Espionage research required to build spy drones' });
        }

        // Deduct resources
        planet.resources.metal -= totalCost.metal;
        planet.resources.crystal -= totalCost.crystal;
        planet.resources.deuterium -= totalCost.deuterium;

        // Build ships
        fleet[shipType] += amount;

        await Promise.all([fleet.save(), planet.save()]);

        // Check for fleet-related achievements
        const totalShips = Object.values(fleet).reduce((sum, count) => sum + count, 0);
        if (totalShips >= 1000) {
            await checkAchievement(req.user.id, 'FLEET_MASTER');
        }

        res.json({ fleet, resources: planet.resources });
    } catch (error) {
        console.error('Error in buildShip:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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

        // Create a new fleet movement
        const fleetMovement = new FleetMovement({
            userId: req.user.id,
            originPlanetId,
            destinationPlanetId,
            ships,
            resources,
            mission,
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
        console.error('Error in sendFleet:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const attack = async (req, res) => {
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

                // Check for battle-related achievements
                await checkAchievement(req.user.id, 'BATTLE_HARDENED');
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
        console.error('Error in attack:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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

            // Check for colonization achievement
            await checkAchievement(req.user.id, 'FIRST_COLONY');
        }, flightTime * 1000);

        res.json({ message: 'Colonization mission launched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        console.error('Error in colonize:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function getShipCosts(shipType) {
    const costs = {
        raven: { metal: 3000, crystal: 1000, deuterium: 0 },
        marauder: { metal: 6000, crystal: 4000, deuterium: 1000 },
        vandal: { metal: 45000, crystal: 15000, deuterium: 5000 },
        stinger: { metal: 10000, crystal: 6000, deuterium: 2000 },
        brawler: { metal: 30000, crystal: 40000, deuterium: 15000 },
        devastator: { metal: 50000, crystal: 25000, deuterium: 15000 },
        sentinel: { metal: 60000, crystal: 50000, deuterium: 15000 },
        fortress: { metal: 5000000, crystal: 4000000, deuterium: 1000000 },
        transport: { metal: 2000, crystal: 2000, deuterium: 1000 },
        colony: { metal: 10000, crystal: 20000, deuterium: 10000 },
        spyDrones: { metal: 1000, crystal: 1000, deuterium: 0 }
    };
    return costs[shipType] || { metal: 0, crystal: 0, deuterium: 0 };
}

module.exports = {
    getFleet,
    buildShip,
    sendFleet,
    attack,
    colonize
};