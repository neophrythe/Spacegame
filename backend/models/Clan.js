const mongoose = require('mongoose');

const ClanSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    tag: { type: String, required: true, unique: true, maxlength: 5 },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String, maxlength: 1000 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    sharedResources: {
        metal: { type: Number, default: 0 },
        crystal: { type: Number, default: 0 },
        deuterium: { type: Number, default: 0 },
    },
    allianceResearch: {
        weaponsTechnology: { type: Number, default: 0 },
        shieldingTechnology: { type: Number, default: 0 },
        armorTechnology: { type: Number, default: 0 },
    },
    diplomacy: [{
        clanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan' },
        status: { type: String, enum: ['ally', 'enemy', 'neutral'], default: 'neutral' },
    }],
    createdAt: { type: Date, default: Date.now }
});

ClanSchema.methods.addMember = function(userId) {
    if (!this.members.includes(userId)) {
        this.members.push(userId);
    }
};

ClanSchema.methods.removeMember = function(userId) {
    this.members = this.members.filter(memberId => memberId.toString() !== userId.toString());
};

ClanSchema.methods.contributeResources = function(resources) {
    for (const [resourceType, amount] of Object.entries(resources)) {
        this.sharedResources[resourceType] += amount;
    }
};

ClanSchema.methods.useSharedResources = function(resources) {
    for (const [resourceType, amount] of Object.entries(resources)) {
        if (this.sharedResources[resourceType] < amount) {
            throw new Error(`Insufficient ${resourceType} in shared resources`);
        }
        this.sharedResources[resourceType] -= amount;
    }
};

ClanSchema.methods.upgradeAllianceResearch = function(researchType) {
    if (this.allianceResearch.hasOwnProperty(researchType)) {
        this.allianceResearch[researchType]++;
    } else {
        throw new Error(`Invalid alliance research type: ${researchType}`);
    }
};

ClanSchema.methods.setDiplomacyStatus = function(otherClanId, status) {
    const existingRelation = this.diplomacy.find(d => d.clanId.toString() === otherClanId.toString());
    if (existingRelation) {
        existingRelation.status = status;
    } else {
        this.diplomacy.push({ clanId: otherClanId, status });
    }
};

module.exports = mongoose.model('Clan', ClanSchema);