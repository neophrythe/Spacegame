const Galaxy = require('../models/Galaxy');
const System = require('../models/System');
const Planet = require('../models/Planet');

exports.getGalaxies = async (req, res) => {
    try {
        const galaxies = await Galaxy.find().populate('systems');
        res.json(galaxies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGalaxy = async (req, res) => {
    try {
        const galaxy = await Galaxy.findById(req.params.id).populate({
            path: 'systems',
            populate: {
                path: 'planets',
            },
        });
        res.json(galaxy);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
