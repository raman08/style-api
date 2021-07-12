const mongoose = require('mongoose');

const collectionSchema = mongoose.Schema({
	category: {
		type: String,
		required: true,
	},
	imageURI: {
		type: String,
	},
	brand: {
		type: String,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
});

module.exports = mongoose.model('Collection', collectionSchema);
