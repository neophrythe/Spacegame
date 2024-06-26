const express = require('express');
const { sendSpyMission } = require('../controllers/espionageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/spy', authMiddleware, sendSpyMission);

module.exports = router;