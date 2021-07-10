const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.post(
	'/verify',
	body('phoneNo').isMobilePhone().withMessage('Invalid Phone Number'),
	authController.postSendOtp
);

router.post(
	'/verify/otp',
	[
		body('phoneNo').isMobilePhone().withMessage('Invalid Phone Number'),
		body('otp')
			.isNumeric()
			.isLength({ min: 4, max: 4 })
			.withMessage('Invalid Otp'),
	],
	authController.postVerifyPhoneNo
);

router.post(
	'/user/signup',
	[
		body('name')
			.trim()
			.isAscii()
			.withMessage('Should Only contain the alphanumeric chracters'),
		body('phoneNo')
			.isMobilePhone()
			.withMessage('Invalid Phone Number')
			.custom(async (value, { req }) => {
				const user = await User.findOne({ phoneNo: value });
				console.log(user);
				if (user) {
					throw new Error(
						'User already register with this phone number. Sign In instead?'
					);
				}
				return true;
			}),
		body('password')
			.isLength({ min: 8 })
			.withMessage('Password should be minimum eight chracters'),
		body('age').isNumeric().withMessage('Invalid Age'),
		body('gender')
			.isIn(['Male', 'Female', 'Prefer Not to Say'])
			.withMessage('Invalid Gender'),
	],
	authController.postSignUp
);

module.exports = router;
