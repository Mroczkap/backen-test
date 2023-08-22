const express = require('express');
const router = express.Router();
const turniejeControler = require('../controllers/turniejeControler');

router.get('/', turniejeControler.handleTurnieje);

module.exports = router;