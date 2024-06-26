const { calculateFlightTime, calculateGalaxyDistance, calculateSystemDistance, calculatePlanetDistance } = require('./gameLogic');

const calculateTotalFlightTime = (start, destination, shipType) => {
    const galaxyDistance = calculateGalaxyDistance(start.galaxy, destination.galaxy);
    const systemDistance = calculateSystemDistance(start.system, destination.system);
    const planetDistance = calculatePlanetDistance(start.planet, destination.planet);
    const totalDistance = galaxyDistance + systemDistance + planetDistance;
    return calculateFlightTime(totalDistance, shipType);
};

const manageFleetComposition = (fleet, action, shipType, amount) => {
    if (action === 'add') {
        fleet[shipType] = (fleet[shipType] || 0) + amount;
    } else if (action === 'remove' && fleet[shipType]) {
        fleet[shipType] = Math.max(0, fleet[shipType] - amount);
    }
    return fleet;
};

module.exports = {
    calculateTotalFlightTime,
    manageFleetComposition
};
