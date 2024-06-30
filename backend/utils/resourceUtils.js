const gameConfig = require('../config/gameConfig');

const calculateResourceProduction = (planet) => {
    const bonus = Math.random() * 0.3 + 0.9; // 90% to 120%
    const metalProduction = gameConfig.resources.baseProduction.metal * planet.buildings.metalMine * bonus;
    const crystalProduction = gameConfig.resources.baseProduction.crystal * planet.buildings.crystalMine * bonus;
    const deuteriumProduction = gameConfig.resources.baseProduction.deuterium * planet.buildings.deuteriumMine * bonus;
    return { metal: metalProduction, crystal: crystalProduction, deuterium: deuteriumProduction };
};

const updateResources = async (planet) => {
    const now = new Date();
    const timeDiff = (now - planet.lastUpdate) / 3600000; // time difference in hours

    planet.resources.metal += calculateProduction(planet.buildings.metalMine, gameConfig.resources.baseProduction.metal) * timeDiff;
    planet.resources.crystal += calculateProduction(planet.buildings.crystalMine, gameConfig.resources.baseProduction.crystal) * timeDiff;
    planet.resources.deuterium += calculateProduction(planet.buildings.deuteriumMine, gameConfig.resources.baseProduction.deuterium) * timeDiff;

    planet.lastUpdate = now;
    await planet.save();
};

const calculateProduction = (mineLevel, baseProduction) => {
    return Math.floor(baseProduction * Math.pow(gameConfig.resources.productionFactor, mineLevel));
};

module.exports = {
    calculateResourceProduction,
    updateResources,
    calculateProduction
};