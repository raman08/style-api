const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const User = require('../models/user');

// ##########
// 		Controller to send an Otp to a phoneNo
//
//		Required => phoneNo: The number to verify.
//
// ##########
exports.postSendOtp = async (req, res, next) => {
	const { phoneNo } = req.body;

	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.array().map(error => {
				return {
					error: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
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
			console.log(err);
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
					error: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
		});
	}

	client.verify
		.services(process.env.TWILIO_SERVICE_SID)
		.verificationChecks.create({ to: `+${phoneNo}`, code: otp })
		.then(async verification_check => {
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
					error: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
		});
	}

	const { name, password, age, gender, phoneNo, prefrenceStyle, verified } =
		req.body;

	try {
		const hashPassword = await bcrypt.hash(password, 12);
		const user = new User({
			name: name,
			phoneNo: phoneNo,
			password: hashPassword,
			age: age,
			gender: gender,
			prefrenceStyle: prefrenceStyle,
			verified: verified,
		});

		await user.save();

		res.status(201).json({
			message: 'User register sucessfully!',
			user: { _id: user._id, name: user.name, verified: verified },
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'Something went wrong. Plese try again later.',
		});
	}
};
