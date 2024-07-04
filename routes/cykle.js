const express = require('express');
const router = express.Router();
const cyklController = require('../controllers/cyklController');

router.post('/', cyklController.handleAdd);
router.get('/', cyklController.handleShow);
router.put('/', cyklController.handleList);

module.exports = router;