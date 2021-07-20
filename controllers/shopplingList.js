const ShoppingList = require('../models/shoppingList');
const User = require('../models/user');

exports.getLists = async (req, res, next) => {
	if (!req.isAuth) {
		return res.status(403).json({ message: 'User not authorized' });
	}

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

	console.log(user);

	res.status(200).json({
		list: user.shoppingList,
	});
};

exports.getList = async (req, res, next) => {
	if (!req.isAuth) {
		return res.status(403).json({ message: 'User not authorized' });
	}

	const listId = req.params.listId;

	if (!listId) {
		return res.status(401).json({ message: 'No list Id provided' });
	}
	try {
		const list = await ShoppingList.findById(listId);

		if (!list) {
			return res
				.status(404)
				.json({ message: 'No Shopping List found', statusCode: 404 });
		}

		const listData = {
			_id: list._id,
			title: list.title,
			items: list.items,
		};

		res.status(200).json({ list: listData });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.postList = async (req, res, next) => {
	if (!req.isAuth) {
		return res.status(403).json({ message: 'User not authorized' });
	}

	const { title, items } = req.body;

	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({
				message: 'No user found',
				errorCode: 404,
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
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.deleteList = async (req, res, next) => {
	if (!req.isAuth) {
		return res.status(403).json({ message: 'User not authorized' });
	}

	const listId = req.params.listId;

	if (!listId) {
		return res.status(404).json({ message: 'No list Id provided' });
	}

	try {
		const user = await User.findById(req.user._id);

		await ShoppingList.deleteOne({ _id: listId, userId: req.user._id });

		user.shoppingList.pull(listId);

		user.save();

		res.status(201).json({
			message: 'List Deleted Sucessfully',
			statusCode: 200,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.postUpdateList = async (req, res, next) => {
	if (!req.isAuth) {
		return res.status(403).json({ message: 'User not authorized' });
	}

	const listId = req.params.listId;
	console.log(listId);

	const { title, items } = req.body;

	if (!listId) {
		return res.status(404).json({ message: 'No list Id provided' });
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
			statusCode: 200,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};
