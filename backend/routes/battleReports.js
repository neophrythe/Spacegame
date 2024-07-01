const express = require('express');
const router = express.Router();
const battleReportController = require('../controllers/battleReportController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, battleReportController.getAllBattleReports);
router.get('/:id', auth, battleReportController.getBattleReport);

module.exports = router;