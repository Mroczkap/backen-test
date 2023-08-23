const express = require('express');
const router = express.Router();
const finishGroupController = require('../controllers/finishGroupController');

router.post('/', finishGroupController.handleFinish);

module.exports = router;