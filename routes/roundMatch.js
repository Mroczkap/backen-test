const express = require('express');
const router = express.Router();
const roundMatchController = require('../controllers/roundMatchController');

router.get('/', roundMatchController.handleRoundMatch);

module.exports = router;