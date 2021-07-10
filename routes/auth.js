const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/verify', authController.postSendOtp);

router.post('/verify/otp', authController.postVerifyPhoneNo);

router.post('/user/signup', authController.postSignUp);

module.exports = router;
