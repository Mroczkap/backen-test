const express = require('express');
const router = express.Router();
const saveGroupmatchController = require('../controllers/saveGroupmatchController');

router.post('/', saveGroupmatchController.handleSave);

module.exports = router;