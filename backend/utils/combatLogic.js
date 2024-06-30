const gameConfig = require('../config/gameConfig');

function simulateCombat(attackerFleet, defenderFleet, attackerResearch, defenderResearch) {
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
}

function prepareFleetForCombat(fleet, research) {
    let preparedFleet = { ships: {}, totalFirepower: 0, totalShield: 0, totalHull: 0 };

    for (let shipType in fleet) {
        if (fleet[shipType] > 0) {
            let shipStats = gameConfig.ships[shipType];
            let quantity = fleet[shipType];

            preparedFleet.ships[shipType] = {
                quantity,
                firepower: shipStats.firepower * (1 + research.weaponsTechnology * 0.1),
                shield: shipStats.shield * (1 + research.shieldingTechnology * 0.1),
                hull: shipStats.hull * (1 + research.armorTechnology * 0.1)
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
        metal: Math.floor(totalCapacity * gameConfig.combat.lootPercentage.metal),
        crystal: Math.floor(totalCapacity * gameConfig.combat.lootPercentage.crystal),
        deuterium: Math.floor(totalCapacity * gameConfig.combat.lootPercentage.deuterium)
    };
}

module.exports = {
    simulateCombat
};