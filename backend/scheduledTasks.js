const cron = require('node-cron');
const Planet = require('./models/Planet');
const Research = require('./models/Research');
const FleetMovement = require('./models/FleetMovement');
const { updateResources } = require('./utils/resourceUtils');
const { resolveFleetMovements } = require('./utils/fleetUtils');
const { completeResearch } = require('./utils/researchUtils');

// Update resources every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('Updating resources...');
    const planets = await Planet.find();
    for (let planet of planets) {
        await updateResources(planet);
    }
});

// Resolve fleet movements every minute
cron.schedule('* * * * *', async () => {
    console.log('Resolving fleet movements...');
    await resolveFleetMovements();
});

// Complete research every minute
cron.schedule('* * * * *', async () => {
    console.log('Completing research...');
    const researches = await Research.find({ 'researchQueue.0': { $exists: true } });
    for (let research of researches) {
        await completeResearch(research);
    }
});

module.exports = {
    startScheduledTasks: () => {
        console.log('Scheduled tasks started');
    }
};