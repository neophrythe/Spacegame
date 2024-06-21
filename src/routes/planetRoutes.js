const express = require('express');
const { getPlanet, getAllPlanets, abandonPlanet, getColonizationLimit } = require('../controllers/planetController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllPlanets);
router.get('/:id', authMiddleware, getPlanet);
router.post('/abandon', authMiddleware, abandonPlanet);
router.get('/colonization-limit', authMiddleware, getColonizationLimit);

module.exports = router;