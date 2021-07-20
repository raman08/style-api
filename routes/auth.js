const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const { isAuth } = require('../middleware/isAuth');
const User = require('../models/user');

const router = express.Router();

// Send Otp Route
router.post(
	'/verify',
	body('phoneNo').isMobilePhone().withMessage('Invalid Phone Number'),
	authController.postSendOtp
);

// Verify Otp Route
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

// SignUp Route
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

// SignIn With Password Route
router.post(
	'/user/signin/password',
	[body('phoneNo').isMobilePhone().withMessage('Invalid Phone Number')],
	authController.postSignInByPassword
);

// SignIn With Refresh Token
router.post('/user/signin/refresh', authController.postSignInByRefreshToken);

// Changing the password
router.post('/user/change/password', isAuth, authController.postChangePassword);

// Secert (Only signin user can acess this)
router.get('/secret', isAuth, (req, res, next) => {
	if (req.isAuth) {
		return res.json({ secret: 'This is a secret' });
	}
	res.status(401).json({ secret: null, error: 'Data Breach' });
});

module.exports = router;
