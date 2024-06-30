const express = require('express');
const router = express.Router();
const galaxyController = require('../controllers/galaxyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/player/location', authMiddleware, galaxyController.getPlayerLocation);
router.post('/planets/:planetId/colonize', authMiddleware, galaxyController.colonizePlanet);

module.exports = router;