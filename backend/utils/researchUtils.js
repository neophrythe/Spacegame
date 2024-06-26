const calculateResearchTime = (researchLevel, researchType) => {
    const baseTimes = {
        'metalResearch': 120,
        'crystalResearch': 150,
        'deuteriumResearch': 180,
        'shipBuilding': 240,
        'weaponTypes': 300,
        'shieldTypes': 300,
        'planetaryShield': 360
    };
    return Math.floor(baseTimes[researchType] * Math.pow(1.5, researchLevel)) * 60; // Time in seconds
};

const applyResearchEffects = (research, effects) => {
    // Apply research effects to the game state
    Object.entries(effects).forEach(([key, value]) => {
        research[key] = (research[key] || 0) + value;
    });
    return research.save();
};

module.exports = {
    calculateResearchTime,
    applyResearchEffects
};
