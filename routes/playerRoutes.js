const express = require("express");
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/', playerController.getAllPlayers);
router.post('/', playerController.createNewPlayer);
router.put('/', playerController.updatePlayer);
router.delete('/', playerController.deletePlayer);

module.exports = router;
