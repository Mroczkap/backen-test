const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.post('/', tournamentController.handleCreate);
router.get('/', tournamentController.getTournaments);

module.exports = router;