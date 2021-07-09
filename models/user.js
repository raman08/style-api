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
	prefrenceStyle: {
		type: String,
		default: 'Mens',
	},
	verified: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model('User', userSchema);
