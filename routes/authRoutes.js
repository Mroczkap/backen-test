const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');

router.post('/login', loginLimiter, authController.handleLogin);
router.get('/logout', authController.handleLogout);
// Refresh token route
router.get('/refresh', authController.handleRefreshToken);

module.exports = router;