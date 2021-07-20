const { validationResult } = require('express-validator');

const Look = require('../models/looks');
const Collection = require('../models/userCollection');
const User = require('../models/user');

exports.getLooks = async (req, res, next) => {
	if (!req.isAuth) {
		res.status(403).json({ message: 'User not authorized' });
	}

	const lookType = req.query.type;
	const filterQuery = {
		userId: req.user._id,
	};

	if (lookType) {
		console.log(lookType);
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

		console.log(looks);
		console.log(looksData);
		res.json({ looks: looksData });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

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
		res.status(403).json({ message: 'User not authorized' });
	}

	const { type, name, clothings } = req.body;

	try {
		const look = Look({
			type,
			name,
			clothings,
			userId: req.user._id,
		});
		const user = await User.findById(req.user._id);

		await look.save();

		clothings.forEach(async cloth => {
			const collection = await Collection.findById(cloth);
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
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.deleteLook = async (req, res, next) => {
	const lookId = req.params.lookId;
	try {
		const user = await User.findById(req.user._id);
		const look = await Look.findById(lookId);

		if (!look) {
			return res.status(404).json({ message: 'No Look Found' });
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
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};
