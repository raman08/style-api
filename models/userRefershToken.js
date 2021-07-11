const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userRefreshTokenSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	expiresAt: {
		type: Date,
	},
});

userRefreshTokenSchema.statics.createToken = async function (user) {
	let expiresAt = new Date();

	expiresAt.setSeconds(
		expiresAt.getSeconds() + process.env.JWT_REFRESH_EXPIRE_TIME
	);

	console.log(expiresAt.getTime());
	const token = uuidv4();

	const documentData = await this.findOne({ userId: user._id });

	if (documentData) {
		console.log('Existing User');
		documentData.token = token;
		await documentData.save();

		return documentData.token;
	}

	const data = new this({
		token: token,
		userId: user._id,
		expiresAt: expiresAt.getTime(),
	});

	console.log(data);

	const refreshToken = await data.save();
	return refreshToken.token;
};

userRefreshTokenSchema.statics.verifyExpiration = token => {
	return token.expiresAt.getTime() < new Date().getTime();
};

module.exports = mongoose.model('UserRefreshToken', userRefreshTokenSchema);
