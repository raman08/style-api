const { validationResult } = require('express-validator');

const Look = require('../models/looks');
const Collection = require('../models/userCollection');
const User = require('../models/user');

// ##########
// 		Controller to get all looks from user and optionally filter by type
//
//		Required => (Query Paramater) type (Optional): Type to filter
// ##########
exports.getLooks = async (req, res, next) => {
	if (!req.isAuth) {
		res.status(403).json({
			message: 'User not authorized',
			statusCode: 403,
		});
	}

	const lookType = req.query.type;
	const filterQuery = {
		userId: req.user._id,
	};

	if (lookType) {
		// console.log(lookType);
		filterQuery.type = lookType;
	}

	try {
		const looks = await Look.find(filterQuery).populate(
			'clothings',
			'_id category brand imageURI'
		);
		const looksData = looks.map(look => {
			return {
				_id: look._id,
				type: look.type,
				name: look.name,
				clothings: look.clothings,
			};
		});

		// console.log(looksData);
		res.json({
			message: 'Looks fetched Sucessfully',
			looks: looksData,
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to create a new look.
//
//		Required => type: Type of look
// 					name: Unique name of look
// 					clothings: Array of collections id to be included in the look
// ##########
exports.postLook = async (req, res, next) => {
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
		res.status(403).json({
			message: 'User not authorized',
			statusCode: 403,
		});
	}

	const { type, name, clothings } = req.body;

	try {
		const look = Look({
			type,
			name,
			clothings,
			userId: req.user._id,
		});

		const collectionDocs = [];
		const errId = [];

		const user = await User.findById(req.user._id);

		await look.save();

		for (let cloth of clothings) {
			const collection = await Collection.findById(cloth);

			if (!collection) {
				errId.push(cloth);
			} else {
				collectionDocs.push(collection);
			}
		}

		if (errId.length > 0) {
			return res.status(400).json({
				message: 'Collection with the id not found',
				ids: errId,
				statusCode: 400,
			});
		}

		collectionDocs.forEach(async collection => {
			collection.looks.push(look._id);
			await collection.save();
		});

		user.looks.push(look._id);

		await user.save();

		const lookData = {
			_id: look._id,
			type: look.type,
			name: look.name,
			clothings: look.clothings,
		};

		res.status(201).json({
			message: 'Look created sucessfully!',
			look: lookData,
			statusCode: 201,
		});
	} catch (err) {
		console.log(err);
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to delete a specific look
//
//		Required => (Url Paramater) looId : ID of the look to be deleted
// ##########
exports.deleteLook = async (req, res, next) => {
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

	const lookId = req.params.lookId;
	try {
		const user = await User.findById(req.user._id);
		const look = await Look.findById(lookId);

		if (!look) {
			return res
				.status(404)
				.json({ message: 'No Look Found', statusCode: 404 });
		}

		look.clothings.forEach(async collectionId => {
			const collection = await Collection.findById(collectionId);

			collection.looks.pull(lookId);
			await collection.save();
		});

		await Look.deleteOne({ _id: lookId, userId: req.user._id });

		user.looks.pull(lookId);
		await user.save();

		res.json({
			message: 'Look deleted Sucessfully',
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};
