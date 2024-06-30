const gameConfig = require('../config/gameConfig');

const calculateResourceProduction = (mineLevel, researchLevel) => {
    const baseProduction = gameConfig.resources.baseProduction.metal; // Assuming metal as base
    return Math.floor(baseProduction * Math.pow(gameConfig.resources.productionFactor, mineLevel) * (1 + researchLevel * gameConfig.resources.researchBonus));
};

const calculateBuildingTime = (buildingLevel, buildingType) => {
    const baseTime = gameConfig.buildings[buildingType].cost.metal + gameConfig.buildings[buildingType].cost.crystal;
    return Math.floor(baseTime * Math.pow(gameConfig.buildings[buildingType].factor, buildingLevel)) * 60; // Time in seconds
};

const calculateFlightTime = (originPlanet, destinationPlanet) => {
    const distance = Math.sqrt(
        Math.pow(originPlanet.galaxy - destinationPlanet.galaxy, 2) +
        Math.pow(originPlanet.system - destinationPlanet.system, 2) +
        Math.pow(originPlanet.position - destinationPlanet.position, 2)
    );
    const baseSpeed = 1000; // Base speed units per hour
    return Math.floor(distance / baseSpeed * 3600); // Time in seconds
};

const shipSpecs = gameConfig.ships;

const simulateCombat = (attackerFleet, defenderFleet, attackerResearch, defenderResearch) => {
    let attackerShips = { ...attackerFleet };
    let defenderShips = { ...defenderFleet };
    let rounds = [];

    for (let round = 1; round <= 6; round++) {
        let attackerDamage = calculateDamage(attackerShips, attackerResearch);
        let defenderDamage = calculateDamage(defenderShips, defenderResearch);

        applyDamage(defenderShips, attackerDamage, defenderResearch);
        applyDamage(attackerShips, defenderDamage, attackerResearch);

        rounds.push({
            round,
            attackerDamage,
            defenderDamage,
            attackerShipsRemaining: { ...attackerShips },
            defenderShipsRemaining: { ...defenderShips },
        });

        if (isFleetDestroyed(attackerShips) || isFleetDestroyed(defenderShips)) {
            break;
        }
    }

    const attackerWins = !isFleetDestroyed(attackerShips);
    const resourcesLooted = attackerWins ? calculateLoot(defenderFleet) : { metal: 0, crystal: 0, deuterium: 0 };

    return {
        attackerWins,
        rounds,
        resourcesLooted,
    };
};

const calculateDamage = (ships, research) => {
    return Object.entries(ships).reduce((totalDamage, [shipType, count]) => {
        const baseAttack = shipSpecs[shipType].firepower * count;
        return totalDamage + baseAttack * (1 + research.weaponsTechnology * 0.1);
    }, 0);
};

const applyDamage = (ships, incomingDamage, research) => {
    let remainingDamage = incomingDamage;

    for (const [shipType, count] of Object.entries(ships)) {
        if (count === 0) continue;

        const shipDefense = shipSpecs[shipType].hull * (1 + research.armorTechnology * 0.1);
        const shipShield = shipSpecs[shipType].shield * (1 + research.shieldingTechnology * 0.1);

        const damagePerShip = Math.max(0, remainingDamage / count - shipShield);
        const shipsDestroyed = Math.min(count, Math.floor(damagePerShip / shipDefense));

        ships[shipType] -= shipsDestroyed;
        remainingDamage -= shipsDestroyed * (shipDefense + shipShield);

        if (remainingDamage <= 0) break;
    }
};

const isFleetDestroyed = (ships) => {
    return Object.values(ships).every(count => count === 0);
};

const isAlien = (user) => user.role === 'admin';

const getBuildingTime = (baseTime, user) => {
    return isAlien(user) ? baseTime / 100 : baseTime;
};

const getProductionRate = (baseRate, user) => {
    return isAlien(user) ? baseRate * 50 : baseRate;
};

const getResourceBonus = (baseResource, user, isAlienGalaxy) => {
    let bonus = baseResource;
    if (isAlien(user)) {
        bonus *= 50;
    }
    if (isAlienGalaxy) {
        bonus *= 5;
    }
    return bonus;
};

const calculateCombatPower = (fleet) => {
    return Object.entries(fleet).reduce((total, [shipType, quantity]) => {
        return total + (shipSpecs[shipType].firepower || 0) * quantity;
    }, 0);
};

const calculateBuildingDefense = (buildings) => {
    return Object.entries(buildings).reduce((total, [buildingType, level]) => {
        return total + (gameConfig.buildings[buildingType].defense || 0) * level;
    }, 0);
};

const calculateSurvivors = (fleet, lossFactor) => {
    const survivors = {};
    Object.entries(fleet).forEach(([shipType, quantity]) => {
        survivors[shipType] = Math.floor(quantity * (1 - lossFactor * gameConfig.combat.debrisFactor));
    });
    return survivors;
};

const calculateLoot = (defenderFleet) => {
    let totalCapacity = Object.entries(defenderFleet).reduce((sum, [shipType, quantity]) => {
        return sum + shipSpecs[shipType].capacity * quantity;
    }, 0);

    return {
        metal: Math.floor(totalCapacity * 0.5),
        crystal: Math.floor(totalCapacity * 0.3),
        deuterium: Math.floor(totalCapacity * 0.2)
    };
};

const calculateStorageCapacity = (storageLevel) => {
    const baseStorage = 10000;
    const storageMultiplier = 1.5;
    return Math.floor(baseStorage * Math.pow(storageMultiplier, storageLevel));
};

const calculateResearchTime = (researchLevel, researchType) => {
    const baseCost = gameConfig.research[researchType].cost.metal + gameConfig.research[researchType].cost.crystal;
    return Math.floor(baseCost / 1000 * Math.pow(gameConfig.research[researchType].factor, researchLevel)) * 60; // Time in seconds
};

const calculateResearchCost = (researchLevel, researchType) => {
    const baseCost = gameConfig.research[researchType].cost;
    const factor = Math.pow(gameConfig.research[researchType].factor, researchLevel);

    return {
        metal: Math.floor(baseCost.metal * factor),
        crystal: Math.floor(baseCost.crystal * factor),
        deuterium: Math.floor((baseCost.deuterium || 0) * factor)
    };
};

module.exports = {
    calculateResourceProduction,
    calculateBuildingTime,
    calculateFlightTime,
    simulateCombat,
    calculateDamage,
    applyDamage,
    isFleetDestroyed,
    isAlien,
    getBuildingTime,
    getProductionRate,
    getResourceBonus,
    calculateCombatPower,
    calculateBuildingDefense,
    calculateSurvivors,
    calculateLoot,
    calculateStorageCapacity,
    calculateResearchTime,
    calculateResearchCost,
    shipSpecs,
};