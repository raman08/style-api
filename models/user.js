const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	phoneNo: {
		type: Number,
		required: true,
	},
	age: {
		type: String,
		required: true,
	},
	gender: {
		type: String,
		required: true,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	collections: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'collection',
		},
	],
	looks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'looks',
		},
	],
});

module.exports = mongoose.model('User', userSchema);
