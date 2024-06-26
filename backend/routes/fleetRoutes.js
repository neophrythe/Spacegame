const express = require('express');
const { getFleet, sendFleet, attack, colonize } = require('../controllers/fleetController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getFleet);
router.post('/send', authMiddleware, sendFleet);
router.post('/attack', authMiddleware, attack);
router.post('/colonize', authMiddleware, colonize);

module.exports = router;