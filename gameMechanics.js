// gameMechanics.js

const Planet = require('./models/Planet');
const Research = require('./models/Research');
const { calculateResourceProduction } = require('./gameLogic');

const updateResources = async (userId) => {
    const planets = await Planet.find({ userId });
    const research = await Research.findOne({ userId });

    for (let planet of planets) {
        const now = new Date();
        const timeDiff = (now - planet.lastResourceUpdate) / 3600000; // time difference in hours

        planet.resources.metal += calculateResourceProduction(planet.buildings.metalMine, research.metalResearch) * timeDiff;
        planet.resources.crystal += calculateResourceProduction(planet.buildings.crystalMine, research.crystalResearch) * timeDiff;
        planet.resources.deuterium += calculateResourceProduction(planet.buildings.deuteriumMine, research.deuteriumResearch) * timeDiff;

        planet.lastResourceUpdate = now;
        await planet.save();
    }
};

const checkBuildingQueue = async (userId) => {
    const planets = await Planet.find({ userId });

    for (let planet of planets) {
        if (planet.buildingQueue && planet.buildingQueue.length > 0) {
            const [currentBuilding] = planet.buildingQueue;
            if (new Date() >= currentBuilding.completionTime) {
                planet.buildings[currentBuilding.type]++;
                planet.buildingQueue.shift();
                await planet.save();
            }
        }
    }
};

const checkResearchQueue = async (userId) => {
    const research = await Research.findOne({ userId });

    if (research.researchQueue && research.researchQueue.length > 0) {
        const [currentResearch] = research.researchQueue;
        if (new Date() >= currentResearch.completionTime) {
            research[currentResearch.type]++;
            research.researchQueue.shift();
            await research.save();
        }
    }
};

module.exports = {
    updateResources,
    checkBuildingQueue,
    checkResearchQueue
};