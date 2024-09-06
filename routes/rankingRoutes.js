const express = require('express');
const router = express.Router();
const rankingsController = require('../controllers/rankingController');

router.post('/', rankingsController.handleAdd);
router.get('/', rankingsController.handleShow);
router.put('/', rankingsController.handleList);

module.exports = router;