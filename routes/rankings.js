const express = require('express');
const router = express.Router();
const rankingsController = require('../controllers/rankingsController');

router.post('/', rankingsController.handleAdd);
router.get('/', rankingsController.handleShow);

module.exports = router;