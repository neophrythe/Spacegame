const Galaxy = require('../models/Galaxy');
const System = require('../models/System');
const Planet = require('../models/Planet');
const User = require('../models/User');

exports.getPlayerLocation = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('homePlanet');
        if (!user.homePlanet) {
            await assignPlayerLocation(user);
        }
        const nearbySystems = await getNearbySystems(user.homePlanet);
        res.json({
            playerLocation: {
                galaxy: user.homePlanet.systemId.galaxyId.id,
                system: user.homePlanet.systemId.id,
                position: user.homePlanet.position
            },
            nearbySystems
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching player location', error: error.message });
    }
};

exports.colonizePlanet = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('homePlanet');
        const planet = await Planet.findById(req.params.planetId).populate('systemId');

        if (planet.ownerId) {
            return res.status(400).json({ message: 'This planet is already colonized' });
        }

        if (!isWithinRange(user.homePlanet, planet)) {
            return res.status(400).json({ message: 'This planet is out of your colonization range' });
        }

        planet.ownerId = user.id;
        user.colonies.push(planet._id);

        await planet.save();
        await user.save();

        const nearbySystems = await getNearbySystems(user.homePlanet);

        res.json({
            message: 'Planet colonized successfully',
            playerLocation: {
                galaxy: user.homePlanet.systemId.galaxyId.id,
                system: user.homePlanet.systemId.id,
                position: user.homePlanet.position
            },
            nearbySystems
        });
    } catch (error) {
        res.status(500).json({ message: 'Error colonizing planet', error: error.message });
    }
};

async function assignPlayerLocation(user) {
    const galaxy = await Galaxy.findOne({ isFull: false }).sort('id');
    if (!galaxy) {
        galaxy = await Galaxy.create({ id: 1 });
    }

    let system = await System.findOne({ galaxyId: galaxy._id, 'planets.ownerId': null });
    if (!system) {
        system = await createNewSystem(galaxy);
    }

    const planet = system.planets.find(p => !p.ownerId);
    planet.ownerId = user._id;
    user.homePlanet = planet._id;

    await system.save();
    await user.save();

    if (await isGalaxyFull(galaxy)) {
        galaxy.isFull = true;
        await galaxy.save();
    }
}

async function getNearbySystems(homePlanet) {
    const homeSystem = await System.findById(homePlanet.systemId);
    const galaxy = await Galaxy.findById(homeSystem.galaxyId);

    const nearbySystems = await System.find({
        galaxyId: galaxy._id,
        id: { $gte: homeSystem.id - 20, $lte: homeSystem.id + 20 }
    }).populate('planets');

    return nearbySystems.flatMap(system =>
        system.planets
            .filter(planet => !planet.ownerId)
            .map(planet => ({
                id: planet._id,
                galaxy: galaxy.id,
                system: system.id,
                position: planet.position,
                name: planet.name,
                status: 'Available'
            }))
    );
}

function isWithinRange(homePlanet, targetPlanet) {
    return Math.abs(homePlanet.systemId.id - targetPlanet.systemId.id) <= 20;
}

async function createNewSystem(galaxy) {
    const systemCount = await System.countDocuments({ galaxyId: galaxy._id });
    const newSystem = await System.create({
        galaxyId: galaxy._id,
        id: systemCount + 1,
        planets: Array.from({ length: 9 + Math.floor(Math.random() * 4) }, (_, i) => ({
            position: i + 1,
            name: `Planet ${i + 1}`
        }))
    });
    galaxy.systems.push(newSystem._id);
    await galaxy.save();
    return newSystem;
}

async function isGalaxyFull(galaxy) {
    const systemCount = await System.countDocuments({ galaxyId: galaxy._id });
    return systemCount >= 300;
}

module.exports = exports;