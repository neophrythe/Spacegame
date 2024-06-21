const express = require('express');
const { getResearch, upgradeResearch } = require('../controllers/researchController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getResearch);
router.post('/upgrade', authMiddleware, upgradeResearch);

module.exports = router;