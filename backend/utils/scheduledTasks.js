const cron = require('node-cron');
const User = require('../models/User');
const { updateResources, checkBuildingQueue, checkResearchQueue } = require('./gameMechanics');

const runScheduledTasks = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        const users = await User.find();
        for (let user of users) {
            await updateResources(user._id);
            await checkBuildingQueue(user._id);
            await checkResearchQueue(user._id);
        }
    });
};

module.exports = runScheduledTasks;