const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycleController');

router.post('/add', cycleController.addTournamentToCycle);
router.get('/ranking', cycleController.showCycleRanking);
router.get('/list', cycleController.listCycles);

module.exports = router;