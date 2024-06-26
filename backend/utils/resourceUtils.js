const calculateResourceProduction = (planet) => {
    const bonus = Math.random() * 0.3 + 0.9; // 90% to 120%
    const metalProduction = 30 * planet.buildings.metalMine * bonus;
    const crystalProduction = 20 * planet.buildings.crystalMine * bonus;
    const deuteriumProduction = 10 * planet.buildings.deuteriumMine * bonus;
    return { metal: metalProduction, crystal: crystalProduction, deuterium: deuteriumProduction };
};

module.exports = { calculateResourceProduction };
