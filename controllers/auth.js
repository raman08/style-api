require('dotenv').config();

const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const User = require('../models/user');
const RefreshToken = require('../models/userRefershToken');

// ##########
// 		Controller to send an Otp to a phoneNo
//
//		Required => phoneNo: The number to verify.
//
// ##########
exports.postSendOtp = async (req, res, next) => {
	const { phoneNo } = req.body;

	const validationErrors = await validationResult(req);

	if (!validationErrors.isEmpty()) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.array().map(error => {
				return {
					message: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
			statusCode: 400,
		});
	}

	client.verify
		.services(process.env.TWILIO_SERVICE_SID)
		.verifications.create({ to: `+${phoneNo}`, channel: 'sms' })
		.then(verification => {
			const data = {
				phoneNo: verification.to,
				channel: verification.channel,
				status: verification.status,
				valid: verification.valid,
				lookup: verification.lookup,
				statusCode: 200,
			};

			res.json({ message: 'Otp Send Sucessfully', data: data });
		})
		.catch(err => {
			if ((err.code = 60200)) {
				return res.status(400).json({
					message: 'Invalid Phone Number',
					statusCode: 400,
				});
			}
			res.status(500).json({
				message: 'Something Went Wrong',
				statusCode: 500,
			});
		});
};

// ##########
// 		Controller to verify the opt
//
//		Required => phoneNo: The number to verify.
// 					otp: The otp entered by user
//
// ##########
exports.postVerifyPhoneNo = async (req, res, next) => {
	const { phoneNo, otp } = req.body;

	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.array().map(error => {
				return {
					message: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
			statusCode: 400,
		});
	}

	client.verify
		.services(process.env.TWILIO_SERVICE_SID)
		.verificationChecks.create({ to: `+${phoneNo}`, code: otp })
		.then(async verification_check => {
			if (!verification_check.valid) {
				return res.status(403).json({
					message: 'Could not verify the phone number!',
					statusCode: 403,
				});
			}
			const data = {
				phoneNo: verification_check.to,
				channel: verification_check.channel,
				status: verification_check.status,
				valid: verification_check.valid,
				statusCode: 200,
			};
			console.log(data);
			res.json({ message: 'Phone number verified', data: data });
		})
		.catch(err => {
			if (err.code === 20404) {
				return res.status(404).json({
					message: 'No otp request for this number',
					statusCode: 404,
				});
			}
			console.log(err);
			res.status(500).json({
				message: 'Something Went Wrong',
				statusCode: 500,
			});
		});
};

// ##########
// 		Controller to create a new user
//
//		Required => name: Name of user
// 					password: Plain text password entered by user
// 					age: Age of the user
// 					gender: Gender of the user
// 					phoneNo: phoneNo of user
// 					prefrenceStyle: The users prefrenceStyle
// 					verified: true or false, depends on if the user phoneNo is verified or not
//
// ##########
exports.postSignUp = async (req, res, next) => {
	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.array().map(error => {
				return {
					message: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
			statusCode: 400,
		});
	}

	const { name, password, age, gender, phoneNo, verified } = req.body;

	try {
		const hashPassword = await bcrypt.hash(password, 12);
		const user = new User({
			name: name,
			phoneNo: phoneNo,
			password: hashPassword,
			age: age,
			gender: gender,
			verified: verified,
		});

		await user.save();

		res.status(201).json({
			message: 'User register sucessfully!',
			user: { _id: user._id, name: user.name, verified: verified },
			statusCode: 201,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: 'Something went wrong',
			statusCode: 500,
		});
	}
};

// ##########
// 		Controller to signin user by password
//
//		Required => phoneNo: phoneNo of user
// 					password: Plain text password entered by user
//
//
// ##########
exports.postSignInByPassword = async (req, res, next) => {
	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.array().map(error => {
				return {
					message: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
			statusCode: 400,
		});
	}

	const { phoneNo, password } = req.body;

	try {
		const user = await User.findOne({ phoneNo: phoneNo });

		if (!user) {
			return res
				.status(404)
				.json({ message: 'No user found!', statusCode: 404 });
		}

		const isEqual = await bcrypt.compare(password, user.password);

		if (!isEqual) {
			return res
				.status(401)
				.json({ message: 'Invalid Password!', statusCode: 401 });
		}

		const token = jwt.sign(
			{ id: user._id, phoneNo: user.phoneNo },
			process.env.JWT_SECERET,
			{ expiresIn: process.env.JWT_EXPIRE_TIME }
		);

		const refreshToken = await RefreshToken.createToken(user);

		res.json({
			message: 'User Signin sucessfull',
			user: { id: user.id, phoneNo: user.phoneNo },
			accessToken: token,
			refreshToken: refreshToken,
			statusCode: 200,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: 'Something Went Wrong',
			statusCode: 500,
		});
	}
};

// ##########
// 		Controller to signin user by password
//
//		Required => refreshToken: refresh token of the user
//
//
// ##########
exports.postSignInByRefreshToken = async (req, res, next) => {
	const { refreshToken } = req.body;

	try {
		const rToken = await RefreshToken.findOne({
			token: refreshToken,
		});

		if (!rToken) {
			return res
				.status(403)
				.json({ message: 'Invalid Refresh Token!', statusCode: 403 });
		}

		if (RefreshToken.verifyExpiration(rToken)) {
			RefreshToken.findByIdAndRemove(rToken._id);
			return res.status(403).json({
				message:
					'Refresh token was expired. Please make a new signin request!',
				statusCode: 403,
			});
		}

		const accessToken = jwt.sign(
			{ id: rToken.userId._id, phoneNo: rToken.userId.phoneNo },
			process.env.JWT_SECERET,
			{ expiresIn: process.env.JWT_EXPIRE_TIME }
		);

		return res.json({
			message: 'Access Token generated!',
			accessToken: accessToken,
			refreshToken: rToken.token,
			statusCode: 200,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: 'Something Went Wrong',
			statusCode: 500,
		});
	}
};

exports.postChangePassword = async (req, res, next) => {
	if (!req.isAuth) {
		return res.status(403).json({
			message: 'User not authorized',
			statusCode: 403,
		});
	}

	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.array().map(error => {
				return {
					message: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
			statusCode: 400,
		});
	}
	const { oldPassword, newPassword } = req.body;

	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res
				.status(404)
				.json({ message: 'No user found!', statusCode: 404 });
		}

		const isEqual = await bcrypt.compare(oldPassword, user.password);

		if (!isEqual) {
			return res
				.status(401)
				.json({ message: 'Invalid Password!', statusCode: 401 });
		}

		const hashPassword = await bcrypt.hash(newPassword, 12);

		user.password = hashPassword;
		await user.save();

		res.status(201).json({
			message: 'Password Change Sucessfully',
			statusCode: 201,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: 'Something Went Wrong',
			statusCode: 500,
		});
	}
};
