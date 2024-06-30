const Fleet = require('../models/Fleet');
const Planet = require('../models/Planet');
const Research = require('../models/Research');
const BattleReport = require('../models/BattleReport');
const gameConfig = require('../config/gameConfig');
const { createNotification } = require('./notificationController');

exports.simulateCombat = async (attackerFleet, defenderFleet, attackerResearch, defenderResearch) => {
    let attacker = prepareFleetForCombat(attackerFleet, attackerResearch);
    let defender = prepareFleetForCombat(defenderFleet, defenderResearch);

    let rounds = [];
    let maxRounds = 6;

    for (let i = 0; i < maxRounds; i++) {
        let round = executeCombatRound(attacker, defender);
        rounds.push(round);

        if (isFleetDestroyed(attacker.ships) || isFleetDestroyed(defender.ships)) {
            break;
        }
    }

    const attackerWins = !isFleetDestroyed(attacker.ships);
    const resourcesLooted = attackerWins ? calculateLoot(defenderFleet) : { metal: 0, crystal: 0, deuterium: 0 };

    return {
        attackerWins,
        rounds,
        survivingAttackerFleet: attacker.ships,
        survivingDefenderFleet: defender.ships,
        resourcesLooted
    };
};

function prepareFleetForCombat(fleet, research) {
    let preparedFleet = { ships: {}, totalFirepower: 0, totalShield: 0, totalHull: 0 };

    for (let shipType in fleet) {
        if (fleet[shipType] > 0) {
            let shipStats = gameConfig.ships[shipType];
            let quantity = fleet[shipType];

            preparedFleet.ships[shipType] = {
                quantity,
                firepower: shipStats.firepower * (1 + research.weapons * 0.1),
                shield: shipStats.shield * (1 + research.shielding * 0.1),
                hull: shipStats.hull * (1 + research.armor * 0.1)
            };

            preparedFleet.totalFirepower += preparedFleet.ships[shipType].firepower * quantity;
            preparedFleet.totalShield += preparedFleet.ships[shipType].shield * quantity;
            preparedFleet.totalHull += preparedFleet.ships[shipType].hull * quantity;
        }
    }

    return preparedFleet;
}

function executeCombatRound(attacker, defender) {
    let round = {
        attackerDamage: 0,
        defenderDamage: 0,
        attackerLosses: {},
        defenderLosses: {}
    };

    round.attackerDamage = calculateDamage(attacker, defender);
    round.defenderDamage = calculateDamage(defender, attacker);

    applyDamage(attacker, round.defenderDamage, round.attackerLosses);
    applyDamage(defender, round.attackerDamage, round.defenderLosses);

    return round;
}

function calculateDamage(attacker, defender) {
    let damage = attacker.totalFirepower;
    if (damage > defender.totalShield) {
        damage -= defender.totalShield;
    } else {
        damage = 0;
    }
    return damage;
}

function applyDamage(fleet, incomingDamage, losses) {
    let remainingDamage = incomingDamage;

    for (let shipType in fleet.ships) {
        let ship = fleet.ships[shipType];
        let shipDamage = Math.min(remainingDamage, ship.quantity * ship.hull);
        let shipsLost = Math.floor(shipDamage / ship.hull);

        if (shipsLost > 0) {
            fleet.ships[shipType].quantity -= shipsLost;
            losses[shipType] = shipsLost;
            fleet.totalFirepower -= shipsLost * ship.firepower;
            fleet.totalShield -= shipsLost * ship.shield;
            fleet.totalHull -= shipsLost * ship.hull;
        }

        remainingDamage -= shipDamage;
        if (remainingDamage <= 0) break;
    }
}

function isFleetDestroyed(fleet) {
    return Object.values(fleet).every(quantity => quantity === 0);
}

function calculateLoot(defenderFleet) {
    let totalCapacity = Object.entries(defenderFleet).reduce((sum, [shipType, quantity]) => {
        return sum + gameConfig.ships[shipType].capacity * quantity;
    }, 0);

    return {
        metal: Math.floor(totalCapacity * 0.5),
        crystal: Math.floor(totalCapacity * 0.3),
        deuterium: Math.floor(totalCapacity * 0.2)
    };
}

exports.resolveCombat = async (attackerId, defenderId, attackerFleetId, defenderPlanetId) => {
    const attacker = await Fleet.findById(attackerFleetId);
    const defender = await Planet.findById(defenderPlanetId);
    const attackerResearch = await Research.findOne({ userId: attackerId });
    const defenderResearch = await Research.findOne({ userId: defenderId });

    const combatResult = await this.simulateCombat(attacker, defender.fleet, attackerResearch, defenderResearch);

    // Update fleets and resources based on combat result
    await updateFleetsAfterCombat(attacker, defender, combatResult);
    await updateResourcesAfterCombat(defender, combatResult);

    // Create battle report
    const battleReport = new BattleReport({
        attackerId,
        defenderId,
        attackerFleetInitial: attacker,
        defenderFleetInitial: defender.fleet,
        rounds: combatResult.rounds,
        attackerWins: combatResult.attackerWins,
        resourcesLooted: combatResult.resourcesLooted
    });
    await battleReport.save();

    // Send notifications
    await createNotification(attackerId, 'combat_result', `Your attack on ${defender.name} has ${combatResult.attackerWins ? 'succeeded' : 'failed'}.`);
    await createNotification(defenderId, 'under_attack', `Your planet ${defender.name} was attacked!`);

    return battleReport;
};

async function updateFleetsAfterCombat(attacker, defender, combatResult) {
    // Update attacker's fleet
    for (let shipType in combatResult.survivingAttackerFleet) {
        attacker[shipType] = combatResult.survivingAttackerFleet[shipType];
    }
    await attacker.save();

    // Update defender's fleet
    defender.fleet = combatResult.survivingDefenderFleet;
    await defender.save();
}

async function updateResourcesAfterCombat(defender, combatResult) {
    if (combatResult.attackerWins) {
        defender.resources.metal -= combatResult.resourcesLooted.metal;
        defender.resources.crystal -= combatResult.resourcesLooted.crystal;
        defender.resources.deuterium -= combatResult.resourcesLooted.deuterium;
        await defender.save();
    }
}

module.exports = exports;