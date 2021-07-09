const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/verify', authController.sendOtpToPhoneNO);
router.post('/verify/otp', authController.verifyPhoneNo);

module.exports = router;
