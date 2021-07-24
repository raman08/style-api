const { validationResult } = require('express-validator');

const ShoppingList = require('../models/shoppingList');
const User = require('../models/user');

// ##########
// 		Controller to get all shopping list from user
//
// ##########
exports.getLists = async (req, res, next) => {
	if (!req.isAuth) {
		return res
			.status(403)
			.json({ message: 'User not authorized', statusCode: 403 });
	}

	try {
		const userId = req.user._id;

		const user = await User.findById(userId).populate(
			'shoppingList',
			'_id title items'
		);

		if (!user) {
			return res
				.status(404)
				.json({ message: 'No user found', statusCode: 404 });
		}

		res.status(200).json({
			message: 'Shopping List fetched sucessfully',
			list: user.shoppingList,
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to get a specific shopping list from user
//
//		Required => (Query Paramater) listId: Id of the list
// ##########
exports.getList = async (req, res, next) => {
	if (!req.isAuth) {
		return res
			.status(403)
			.json({ message: 'User not authorized', statusCode: 403 });
	}

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

	const listId = req.params.listId;

	if (!listId) {
		return res
			.status(401)
			.json({ message: 'No list Id provided', statusCode: 401 });
	}

	try {
		const list = await ShoppingList.findById(listId);

		if (!list) {
			return res.status(404).json({
				message: 'No Shopping List found',
				statusCode: 404,
			});
		}

		const listData = {
			_id: list._id,
			title: list.title,
			items: list.items,
		};

		res.status(200).json({
			message: 'Shopping List fetched Sucessfully',
			list: listData,
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to create a new list.
//
//		Required => title: Title of the list.
// 					items: Array of the item for the list.
// ##########
exports.postList = async (req, res, next) => {
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

	if (!req.isAuth) {
		return res
			.status(403)
			.json({ message: 'User not authorized', statusCode: 403 });
	}

	const { title, items } = req.body;

	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({
				message: 'No user found',
				statusCode: 404,
			});
		}

		const list = new ShoppingList({
			userId: req.user._id,
			title,
			items,
		});

		user.shoppingList.push(list._id);
		await list.save();
		await user.save();

		res.status(201).json({
			message: 'Shopping List Created Sucessfully',
			list: {
				_id: list._id,
				title: list.title,
			},
			statusCode: 201,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to delete a specific list.
//
//		Required => (Query Paramater) listId: Id of the list to be deleted
// ##########
exports.deleteList = async (req, res, next) => {
	if (!req.isAuth) {
		return res
			.status(403)
			.json({ message: 'User not authorized', statusCode: 403 });
	}

	const listId = req.params.listId;

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

	if (!listId) {
		return res
			.status(404)
			.json({ message: 'No list Id provided', statusCode: 404 });
	}

	try {
		const user = await User.findById(req.user._id);

		const list = await ShoppingList.findById(listId);

		if (!list) {
			return res.status(404).json({
				message: 'No shopping list found',
				statusCode: 404,
			});
		}

		await ShoppingList.deleteOne({ _id: listId, userId: req.user._id });

		user.shoppingList.pull(listId);

		user.save();

		res.status(200).json({
			message: 'List Deleted Sucessfully',
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to a specific list.
//		Required => (Query Paramater) listId: Id of the list to be deleted
// 					title: Updated title of the list
// 					items: Updated items for the list
// ##########
exports.postUpdateList = async (req, res, next) => {
	if (!req.isAuth) {
		return res
			.status(403)
			.json({ message: 'User not authorized', statusCode: 403 });
	}

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

	const listId = req.params.listId;

	const { title, items } = req.body;

	if (!listId) {
		return res
			.status(404)
			.json({ message: 'No list Id provided', statusCode: 404 });
	}

	try {
		const list = await ShoppingList.findById(listId);

		if (!list) {
			res.status(404).json({
				message: 'No list found',
				statusCode: 404,
			});
		}

		if (list.title === title && list.items === items) {
			res.status(200).json({
				message: 'Nothing to update',
				statusCode: 200,
			});
		}

		list.title = title;
		list.items = items;

		list.save();

		res.status(201).json({
			message: 'List Updated Sucessfully',
			statusCode: 201,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};
