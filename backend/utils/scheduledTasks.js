const cron = require('node-cron');
const { buildingQueue, researchQueue, fleetMovementQueue } = require('./queue');
const Planet = require('../models/Planet');
const Research = require('../models/Research');
const FleetMovement = require('../models/FleetMovement');
const logger = require('./logger');

const runScheduledTasks = () => {
    cron.schedule('* * * * *', async () => {
        logger.info('Running scheduled tasks');

        try {
            const planets = await Planet.find();
            for (let planet of planets) {
                if (planet.buildingQueue && planet.buildingQueue.length > 0) {
                    const [currentBuilding] = planet.buildingQueue;
                    if (new Date() >= currentBuilding.completionTime) {
                        await buildingQueue.add({ planetId: planet._id, building: currentBuilding });
                    }
                }
            }

            const researches = await Research.find({ 'researchQueue.0': { $exists: true } });
            for (let research of researches) {
                const currentResearch = research.researchQueue[0];
                if (new Date() >= currentResearch.completionTime) {
                    await researchQueue.add({ researchId: research._id, research: currentResearch });
                }
            }

            const fleetMovements = await FleetMovement.find({ arrivalTime: { $lte: new Date() } });
            for (let movement of fleetMovements) {
                await fleetMovementQueue.add({ movementId: movement._id });
            }
        } catch (error) {
            logger.error('Error in scheduled tasks:', error);
        }
    });
};

module.exports = runScheduledTasks;