const express = require('express');
const { createClan, joinClan, leaveClan, getClanInfo } = require('../controllers/clanController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, createClan);
router.post('/join', authMiddleware, joinClan);
router.post('/leave', authMiddleware, leaveClan);
router.get('/:id', authMiddleware, getClanInfo);

module.exports = router;