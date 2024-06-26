const manageColonization = (userId, planet) => {
    planet.userId = userId;
    planet.buildings = {
        metalMine: 1,
        crystalMine: 1,
        deuteriumMine: 1,
        researchCenter: 0,
        shipyard: 0,
        ionCannon: 0,
        ionShield: 0
    };
    planet.resources = { metal: 1000, crystal: 1000, deuterium: 1000 };
    planet.lastResourceUpdate = new Date();
    return planet.save();
};

const allocateResources = (planet, resourceType, amount) => {
    if (planet.resources[resourceType] >= amount) {
        planet.resources[resourceType] -= amount;
        return true;
    }
    return false;
};

const updateResources = (planet, timeDiff, productionRates) => {
    planet.resources.metal += productionRates.metal * timeDiff;
    planet.resources.crystal += productionRates.crystal * timeDiff;
    planet.resources.deuterium += productionRates.deuterium * timeDiff;
    planet.lastResourceUpdate = new Date();
};

module.exports = {
    manageColonization,
    allocateResources,
    updateResources
};