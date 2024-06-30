const mongoose = require('mongoose');
const gameConfig = require('../config/gameConfig');

const planetSchema = new mongoose.Schema({
    name: String,
    resources: {
        metal: { type: Number, default: 0 },
        crystal: { type: Number, default: 0 },
        deuterium: { type: Number, default: 0 },
    },
    storage: {
        metal: { type: Number, default: 10000 },
        crystal: { type: Number, default: 10000 },
        deuterium: { type: Number, default: 10000 },
    },
    overflow: {
        metal: { type: Number, default: 0 },
        crystal: { type: Number, default: 0 },
        deuterium: { type: Number, default: 0 },
    },
    buildings: {
        metalMine: { type: Number, default: 0 },
        crystalMine: { type: Number, default: 0 },
        deuteriumMine: { type: Number, default: 0 },
        metalStorage: { type: Number, default: 0 },
        crystalStorage: { type: Number, default: 0 },
        deuteriumStorage: { type: Number, default: 0 },
        researchCenter: { type: Number, default: 0 },
        shipyard: { type: Number, default: 0 },
        ionCannon: { type: Number, default: 0 },
        ionShield: { type: Number, default: 0 },
    },
    isAlienGalaxy: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastResourceUpdate: { type: Date, default: Date.now },
    systemId: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true },
    position: { type: Number, required: true },
});

planetSchema.methods.updateResources = async function () {
    const now = new Date();
    const timeDiff = (now - this.lastResourceUpdate) / 3600000; // time difference in hours
    const user = await mongoose.model('User').findById(this.userId);
    const research = await mongoose.model('Research').findOne({ userId: this.userId });

    Object.keys(this.resources).forEach(resourceType => {
        const production = this.calculateProduction(resourceType, research);
        const newAmount = this.resources[resourceType] + production * timeDiff;
        const storageLimit = this.storage[resourceType];

        if (newAmount > storageLimit) {
            this.resources[resourceType] = storageLimit;
            this.overflow[resourceType] += newAmount - storageLimit;
        } else {
            this.resources[resourceType] = newAmount;
        }
    });

    this.lastResourceUpdate = now;
    await this.save();
};

planetSchema.methods.calculateProduction = function (resourceType, research) {
    const { getProductionRate, getResourceBonus } = require('../utils/gameLogic');
    const user = mongoose.model('User').findById(this.userId);

    let baseProduction;
    switch (resourceType) {
        case 'metal':
            baseProduction = this.buildings.metalMine * gameConfig.resources.baseProduction.metal;
            break;
        case 'crystal':
            baseProduction = this.buildings.crystalMine * gameConfig.resources.baseProduction.crystal;
            break;
        case 'deuterium':
            baseProduction = this.buildings.deuteriumMine * gameConfig.resources.baseProduction.deuterium;
            break;
        default:
            baseProduction = 0;
    }

    const productionRate = getProductionRate(baseProduction, user);
    return getResourceBonus(productionRate, user, this.isAlienGalaxy);
};

planetSchema.methods.canAfford = function (costs) {
    return Object.keys(costs).every(resourceType =>
        this.resources[resourceType] >= costs[resourceType]
    );
};

planetSchema.methods.deductResources = function (costs) {
    Object.keys(costs).forEach(resourceType => {
        this.resources[resourceType] -= costs[resourceType];
    });
};

planetSchema.methods.addBuilding = function (buildingType) {
    this.buildings[buildingType]++;
};

planetSchema.methods.updateStorage = function () {
    const baseStorage = 10000;
    const storageMultiplier = 1.5;

    ['metal', 'crystal', 'deuterium'].forEach(resourceType => {
        const storageLevel = this.buildings[`${resourceType}Storage`];
        this.storage[resourceType] = Math.floor(baseStorage * Math.pow(storageMultiplier, storageLevel));
    });
};

module.exports = mongoose.model('Planet', planetSchema);