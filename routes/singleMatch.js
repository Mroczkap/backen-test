const express = require('express');
const router = express.Router();
const singleMatchController = require('../controllers/singleMatchController');

router.route('/')
    .post(singleMatchController.handleAdd)
    .get(singleMatchController.handleShow)
 
module.exports = router;