const mongoose = require('mongoose');

const looksSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true,
	},

	type: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	clothings: [
		{ type: mongoose.Schema.Types.ObjectId, min: 1, ref: 'Collection' },
	],
});

module.exports = mongoose.model('Look', looksSchema);
