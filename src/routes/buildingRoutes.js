const express = require('express');
const { getBuildings, upgradeBuilding } = require('../controllers/buildingController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getBuildings);
router.post('/upgrade', authMiddleware, upgradeBuilding);

module.exports = router;