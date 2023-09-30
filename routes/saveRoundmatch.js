const express = require('express');
const router = express.Router();
const saveRoundmatchController = require('../controllers/saveRoundmatchController');

router.route('/')
    .post(saveRoundmatchController.handleSave)
    .put(saveRoundmatchController.handleFree)
 
module.exports = router;