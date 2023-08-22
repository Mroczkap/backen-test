const express = require('express');
const router = express.Router();
const zawodnicyController = require('../controllers/zawodnicyController');

router.get('/', zawodnicyController.handleZawodnicy);

module.exports = router;