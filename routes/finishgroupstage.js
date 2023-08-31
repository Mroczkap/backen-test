const express = require('express');
const router = express.Router();
const finishGroupStageController = require('../controllers/finishGroupStageController');

router.post('/', finishGroupStageController.handleFinish);

module.exports = router;