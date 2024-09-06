const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/finish-group', groupController.handleFinish);
router.post('/finish-stage', groupController.handleGroupFinish);
router.get('/groups', groupController.handleGroups);
router.post('/save-match', groupController.handleSave);

module.exports = router;