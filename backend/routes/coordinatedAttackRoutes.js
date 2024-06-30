const express = require('express');
const router = express.Router();
const coordinatedAttackController = require('../controllers/coordinatedAttackController');
const auth = require('../middleware/auth');

router.post('/create', auth, coordinatedAttackController.createCoordinatedAttack);
router.post('/join', auth, coordinatedAttackController.joinCoordinatedAttack);
router.get('/:attackCode', auth, coordinatedAttackController.getCoordinatedAttack);
router.get('/', auth, coordinatedAttackController.listCoordinatedAttacks);
router.delete('/:attackCode', auth, coordinatedAttackController.cancelCoordinatedAttack);

module.exports = router;