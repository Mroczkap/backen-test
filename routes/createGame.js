const express = require('express');
const router = express.Router();
const createGameController = require('../controllers/createGameController');

router.post('/', createGameController.handleCreate);

module.exports = router;