const mongoose = require('mongoose');

const listSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true,
	},

	title: {
		type: String,
		required: true,
	},

	items: [{ type: String, min: 1 }],
});

module.exports = mongoose.model('ShoppingList', listSchema);
