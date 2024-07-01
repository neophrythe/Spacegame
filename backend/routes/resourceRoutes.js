const express = require('express');
const { getResources, updateResources } = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getResources);
router.post('/update', authMiddleware, updateResources);

module.exports = router;