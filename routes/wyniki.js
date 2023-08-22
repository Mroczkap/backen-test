const express = require('express');
const router = express.Router();
const wynikiController = require('../controllers/wynikiController');

router.get('/', wynikiController.handleWyniki);

module.exports = router;