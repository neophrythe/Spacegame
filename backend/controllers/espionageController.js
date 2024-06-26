
const Fleet = require('../models/Fleet');
const Planet = require('../models/Planet');
const Research = require('../models/Research');
const { calculateFlightTime } = require('../utils/gameLogic');
const { createNotification } = require('./notificationController');

exports.sendSpyMission = async (req, res) => {
    try {
        const { originPlanetId, targetPlanetId, numberOfDrones } = req.body;

        const originPlanet = await Planet.findOne({ _id: originPlanetId, userId: req.user.id });
        const targetPlanet = await Planet.findById(targetPlanetId);
        const fleet = await Fleet.findOne({ userId: req.user.id });

        if (!originPlanet || !targetPlanet || !fleet) {
            return res.status(404).json({ message: 'Planet or fleet not found' });
        }

        if (fleet.spyDrones < numberOfDrones) {
            return res.status(400).json({ message: 'Not enough spy drones' });
        }

        const flightTime = calculateFlightTime(originPlanet, targetPlanet) / 200; // 200x faster

        fleet.spyDrones -= numberOfDrones;
        await fleet.save();

        setTimeout(async () => {
            const spyResult = await performEspionage(targetPlanet, numberOfDrones);
            await createNotification(req.user.id, 'spy_report', JSON.stringify(spyResult));
        }, flightTime * 1000);

        res.json({ message: 'Spy mission launched', arrivalTime: new Date(Date.now() + flightTime * 1000) });
    } catch (error) {
        console.error('Error in sendSpyMission:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

async function performEspionage(targetPlanet, numberOfDrones) {
    const targetResearch = await Research.findOne({ userId: targetPlanet.userId });
    const counterEspionageLevel = targetResearch.counterEspionage;

    const successChance = Math.min(numberOfDrones / (counterEspionageLevel + 1), 0.95);

    if (Math.random() < successChance) {
        return {
            success: true,
            resources: targetPlanet.resources,
            buildings: targetPlanet.buildings,
            // Add more information as needed
        };
    } else {
        return {
            success: false,
            message: 'Spy mission failed due to counter-espionage measures'
        };
    }
}