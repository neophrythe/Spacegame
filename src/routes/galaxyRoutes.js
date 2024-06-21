const express = require('express');
const { getGalaxies, getGalaxy } = require('../controllers/galaxyController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getGalaxies);
router.get('/:id', authMiddleware, getGalaxy);

module.exports = router;