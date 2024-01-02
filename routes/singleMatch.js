const express = require('express');
const router = express.Router();
const singleMatchController = require('../controllers/singleMatchController');

router.route('/')
    .post(singleMatchController.handleAdd)
    .get(singleMatchController.handleShow)
    .put(singleMatchController.handleProgress);
 
module.exports = router;