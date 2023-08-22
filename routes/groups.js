const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');

router.get('/', groupsController.hanldeGroups);

module.exports = router;