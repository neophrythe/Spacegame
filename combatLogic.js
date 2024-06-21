// combatLogic.js

const calculateCombatPower = (ships) => {
    const shipPower = {
        'raven': 10,
        'marauder': 25,
        'vandal': 50,
        'stinger': 15,
        'brawler': 30,
        'devastator': 100,
        'sentinel': 40,
        'fortress': 200
    };

    return Object.entries(ships).reduce((total, [shipType, quantity]) => {
        return total + (shipPower[shipType] || 0) * quantity;
    }, 0);
};

const simulateCombat = (attackerFleet, defenderFleet, defenderBuildings) => {
    const attackPower = calculateCombatPower(attackerFleet);
    const defensePower = calculateCombatPower(defenderFleet) + (defenderBuildings.ionCannon * 50);

    const totalPower = attackPower + defensePower;
    const attackerWinChance = attackPower / totalPower;

    const randomOutcome = Math.random();
    const attackerWins = randomOutcome < attackerWinChance;

    let survivingAttackerFleet = {};
    let survivingDefenderFleet = {};
    let resourcesLooted = { metal: 0, crystal: 0, deuterium: 0 };

    if (attackerWins) {
        const survivalRate = defensePower / attackPower / 2;
        Object.entries(attackerFleet).forEach(([shipType, quantity]) => {
            survivingAttackerFleet[shipType] = Math.floor(quantity * (1 - survivalRate));
        });
        resourcesLooted = calculateLoot(defenderBuildings);
    } else {
        const survivalRate = attackPower / defensePower / 2;
        Object.entries(defenderFleet).forEach(([shipType, quantity]) => {
            survivingDefenderFleet[shipType] = Math.floor(quantity * (1 - survivalRate));
        });
    }

    return {
        attackerWins,
        survivingAttackerFleet,
        survivingDefenderFleet,
        resourcesLooted
    };
};

const calculateLoot = (defenderBuildings) => {
    const lootCapacity = 1000 * (defenderBuildings.metalMine + defenderBuildings.crystalMine + defenderBuildings.deuteriumMine);
    return {
        metal: Math.floor(lootCapacity * 0.5),
        crystal: Math.floor(lootCapacity * 0.3),
        deuterium: Math.floor(lootCapacity * 0.2)
    };
};

module.exports = {
    simulateCombat
};