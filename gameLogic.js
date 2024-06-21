// gameLogic.js

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

const calculateFlightTime = (distance, speed) => {
    const baseTime = 3600; // 1 hour base time
    return Math.floor(baseTime * (distance / speed));
};

const calculateGalaxyDistance = (galaxy1, galaxy2) => {
    return Math.abs(galaxy1 - galaxy2) * 20000;
};

const calculateSystemDistance = (system1, system2) => {
    return Math.abs(system1 - system2) * 5;
};

const calculatePlanetDistance = (position1, position2) => {
    return Math.abs(position1 - position2) * 0.1;
};

module.exports = {
    calculateResourceProduction,
    calculateBuildingTime,
    calculateFlightTime,
    calculateGalaxyDistance,
    calculateSystemDistance,
    calculatePlanetDistance
};