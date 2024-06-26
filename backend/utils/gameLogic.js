const calculateResourceProduction = (mineLevel, researchLevel) => {
    const baseProduction = 30; // Base production per hour
    return Math.floor(baseProduction * Math.pow(1.1, mineLevel) * (1 + researchLevel * 0.1));
};

const calculateBuildingTime = (buildingLevel, buildingType) => {
    const baseTimes = {
        'metalMine': 60,
        'crystalMine': 90,
        'deuteriumMine': 120,
        'researchCenter': 180,
        'shipyard': 240,
        'ionCannon': 300,
        'ionShield': 300
    };
    return Math.floor(baseTimes[buildingType] * Math.pow(1.5, buildingLevel)) * 60; // Time in seconds
};

const calculateFlightTime = (originPlanet, destinationPlanet) => {
    // Simple distance calculation, you might want to make this more complex
    const distance = Math.sqrt(
        Math.pow(originPlanet.galaxy - destinationPlanet.galaxy, 2) +
        Math.pow(originPlanet.system - destinationPlanet.system, 2) +
        Math.pow(originPlanet.position - destinationPlanet.position, 2)
    );
    const baseSpeed = 1000; // Base speed units per hour
    return Math.floor(distance / baseSpeed * 3600); // Time in seconds
};

const simulateCombat = (attackerFleet, defenderFleet, defenderBuildings) => {
    // Implement combat logic here
    // This is a placeholder implementation
    const attackerStrength = Object.values(attackerFleet).reduce((sum, count) => sum + count, 0);
    const defenderStrength = Object.values(defenderFleet).reduce((sum, count) => sum + count, 0) +
        Object.values(defenderBuildings).reduce((sum, level) => sum + level * 10, 0);

    const attackerWins = attackerStrength > defenderStrength;

    return {
        attackerWins,
        survivingAttackerFleet: attackerWins ? attackerFleet : {},
        survivingDefenderFleet: attackerWins ? {} : defenderFleet,
        resourcesLooted: attackerWins ? { metal: 1000, crystal: 500, deuterium: 250 } : { metal: 0, crystal: 0, deuterium: 0 }
    };
};

module.exports = {
    calculateResourceProduction,
    calculateBuildingTime,
    calculateFlightTime,
    simulateCombat
};