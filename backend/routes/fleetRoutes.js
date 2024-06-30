const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');
const authMiddleware = require('../middleware/authMiddleware');

// Fleet Management Routes
router.get('/', authMiddleware, fleetController.getFleet);
router.post('/build', authMiddleware, fleetController.buildShip);

// Fleet Movement Routes
router.post('/send', authMiddleware, fleetController.sendFleet);
router.post('/attack', authMiddleware, fleetController.attack);
router.post('/colonize', authMiddleware, fleetController.colonize);

module.exports = router;