const bcrypt = require('bcrypt');
const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const User = require('../models/user');

exports.postSignUp = async (req, res, next) => {
	const { name, password, age, gender, phoneNo, prefrenceStyle } = req.body;

	try {
		const hashPassword = await bcrypt.hash(password, 12);
		const user = new User({
			name: name,
			password: hashPassword,
			age: age,
			gender: gender,
			prefrenceStyle: prefrenceStyle,
		});

		await user.save();

		res.json({
			message: 'User register sucessfully!',
			user: { _id: user._id, name: user.name },
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'Something went wrong. Plese try again later.',
		});
	}
};

exports.sendOtpToPhoneNO = async (req, res, next) => {
	const { phoneNo } = req.body;

	console.log(`Phone No: ${phoneNo}`);
	const user = await User.findOne({ phoneNo: phoneNo, verified: true });

	if (user) {
		return res
			.status(401)
			.json({ message: 'User already register and verified' });
	}

	client.verify
		.services(process.env.TWILIO_SERVICE_SID)
		.verifications.create({ to: `+${phoneNo}`, channel: 'sms' })
		.then(verification => {
			console.log(verification.status);
			res.json({ message: 'Code send' });
		})
		.catch(err => {
			console.log(err);
		});
};

exports.verifyPhoneNo = async (req, res, next) => {
	const { phoneNo, otp } = req.body;

	console.log(phoneNo, otp);

	client.verify
		.services(process.env.TWILIO_SERVICE_SID)
		.verificationChecks.create({ to: `+${phoneNo}`, code: otp })
		.then(async verification_check => {
			console.log(verification_check.status);
			if (verification_check.status === 'approved') {
				const user = await User.findOne({ phoneNo: phoneNo });
				if (!user) {
					res.status(404).json({
						message: 'Phone No not registered',
					});
				}

				user.verified = true;
				await user.save();

				res.json({ message: 'Phone no verified' });
			}
		})
		.catch(err => {
			console.log(err);
		});
};
