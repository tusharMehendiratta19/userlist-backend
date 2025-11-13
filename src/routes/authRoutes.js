const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/changePassword', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;