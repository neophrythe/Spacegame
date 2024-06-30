const mongoose = require('mongoose');
const gameConfig = require('../config/gameConfig');

const ResearchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    energyTechnology: { type: Number, default: 0 },
    laserTechnology: { type: Number, default: 0 },
    ionTechnology: { type: Number, default: 0 },
    hyperspaceTechnology: { type: Number, default: 0 },
    plasmaTechnology: { type: Number, default: 0 },
    combustionDrive: { type: Number, default: 0 },
    impulseDrive: { type: Number, default: 0 },
    hyperspaceDrive: { type: Number, default: 0 },
    espionageTechnology: { type: Number, default: 0 },
    computerTechnology: { type: Number, default: 0 },
    astrophysics: { type: Number, default: 0 },
    intergalacticResearchNetwork: { type: Number, default: 0 },
    gravitonTechnology: { type: Number, default: 0 },
    weaponsTechnology: { type: Number, default: 0 },
    shieldingTechnology: { type: Number, default: 0 },
    armorTechnology: { type: Number, default: 0 },
    researchQueue: [{
        type: { type: String },
        level: { type: Number },
        completionTime: { type: Date }
    }],
    createdAt: { type: Date, default: Date.now }
});

ResearchSchema.methods.canResearch = function(technologyType) {
    const prerequisites = gameConfig.research[technologyType].prerequisites || {};
    return Object.entries(prerequisites).every(([tech, level]) => this[tech] >= level);
};

ResearchSchema.methods.startResearch = function(technologyType) {
    if (!this.canResearch(technologyType)) {
        throw new Error('Prerequisites not met for this research');
    }

    const currentLevel = this[technologyType];
    const researchTime = this.calculateResearchTime(currentLevel, technologyType);
    const completionTime = new Date(Date.now() + researchTime * 1000);

    this.researchQueue.push({
        type: technologyType,
        level: currentLevel + 1,
        completionTime: completionTime
    });
};

ResearchSchema.methods.completeResearch = function() {
    if (this.researchQueue.length === 0) return;

    const completedResearch = this.researchQueue[0];
    if (new Date() >= completedResearch.completionTime) {
        this[completedResearch.type] = completedResearch.level;
        this.researchQueue.shift();
    }
};

ResearchSchema.methods.getResearchStatus = function() {
    this.completeResearch();
    return {
        currentResearch: this.researchQueue[0] || null,
        technologies: {
            energyTechnology: this.energyTechnology,
            laserTechnology: this.laserTechnology,
            ionTechnology: this.ionTechnology,
            hyperspaceTechnology: this.hyperspaceTechnology,
            plasmaTechnology: this.plasmaTechnology,
            combustionDrive: this.combustionDrive,
            impulseDrive: this.impulseDrive,
            hyperspaceDrive: this.hyperspaceDrive,
            espionageTechnology: this.espionageTechnology,
            computerTechnology: this.computerTechnology,
            astrophysics: this.astrophysics,
            intergalacticResearchNetwork: this.intergalacticResearchNetwork,
            gravitonTechnology: this.gravitonTechnology,
            weaponsTechnology: this.weaponsTechnology,
            shieldingTechnology: this.shieldingTechnology,
            armorTechnology: this.armorTechnology
        }
    };
};

ResearchSchema.methods.calculateResearchTime = function(researchLevel, researchType) {
    const baseCost = gameConfig.research[researchType].cost.metal + gameConfig.research[researchType].cost.crystal;
    return Math.floor(baseCost / 1000 * Math.pow(gameConfig.research[researchType].factor, researchLevel)) * 60; // Time in seconds
};

module.exports = mongoose.model('Research', ResearchSchema);