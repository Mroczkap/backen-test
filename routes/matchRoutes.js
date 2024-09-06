const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/listRound', matchController.listRoundMatches);
// Route for saving a round match
router.post('/saveMatch', matchController.saveRoundMatch);
// Route for handling free matches
router.post('/freeMatch', matchController.handleFree);
router.post('/addSingle', matchController.handleAddSingle);
router.get('/getSingleMatch', matchController.handleShowSingle);
router.post('/progress', matchController.handleProgress);

module.exports = router;