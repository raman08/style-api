const { validationResult } = require('express-validator');
var ObjectID = require('mongodb').ObjectID;

const Collection = require('../models/userCollection');
const User = require('../models/user');
const Look = require('../models/looks');
const fileHandel = require('../utils/file');

// ##########
// 		Controller to Get All the collection of particular user or filter by category
//
//		Required => (Optional - query parameter) category: category filter
//
// ##########
exports.getUserCollection = async (req, res, next) => {
	const category = req.query.category;

	if (!req.isAuth) {
		return res.status(401).json({
			message: 'User not authorized. Please Signin to view resourse',
			statusCode: 401,
		});
	}

	const query = {
		userId: req.user._id,
	};

	if (category) {
		query.category = category;
	}

	try {
		const collections = await Collection.find(query);

		const collectionsData = collections.map(collection => {
			return {
				_id: collection._id,
				category: collection.category,
				brand: collection.brand,
				imageURI: collection.imageURI,
			};
		});

		res.json({
			message: 'Collection Fetched Sucessfully',
			collections: collectionsData,
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to create a new User Collection
//
//		Required => category: category of the collection
// 					brand: brand of the collection
// 					collectionImage: image for the collection
//
// ##########
exports.postUserCollection = async (req, res, next) => {
	let validationErrors = await validationResult(req);
	const collectionImage = req.file;

	if (!collectionImage) {
		validationErrors = [
			...validationErrors.array(),
			{
				msg: 'No image file found',
				value: '',
				param: 'collectionImage',
				location: 'body',
			},
		];
	}

	if (validationErrors.length > 0) {
		return res.status(400).json({
			message: 'Invalid Data',
			errors: validationErrors.map(error => {
				return {
					message: error.msg,
					value: error.value,
					param: error.param,
				};
			}),
			statusCode: 400,
		});
	}

	const { category, brand } = req.body;

	if (!req.isAuth) {
		return res.status(401).json({
			message: 'User not authorized. Please Signin to view resourse',
			statusCode: 401,
		});
	}

	try {
		const user = await User.findById(req.user._id);

		const collection = new Collection({
			category: category,
			brand: brand,
			imageURI: `/${collectionImage.path}`,
			userId: req.user._id,
		});

		user.collections.push(collection);
		await collection.save();
		await user.save();

		const collectionData = {
			_id: collection._id,
			category: collection.category,
			brand: collection.brand,
			image: collection.imageURI,
		};

		res.status(201).json({
			message: 'Collection saved Sucessfully',
			collection: collectionData,
			statusCode: 201,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};

// ##########
// 		Controller to delete the user Collection
//
//		Required =>  collectionId (as url parameter): id of the colleciton document to be deleted
//
// ##########
exports.deleteUserCollection = async (req, res, next) => {
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

	const collectionId = req.params.collectionId;
	try {
		const user = await User.findById(req.user._id);
		const collection = await Collection.findById(collectionId);

		if (!collection) {
			return res
				.status(404)
				.json({ message: 'No Collection Found', statusCode: 404 });
		}

		collection.looks.forEach(async lookId => {
			const look = await Look.findById(lookId);

			if (look.clothings.length <= 1) {
				Look.findByIdAndRemove(lookId);
			}

			look.clothings.pull(collectionId);
			await look.save();
		});

		await Collection.deleteOne({ _id: collectionId, userId: req.user._id });

		user.collections.pull(collectionId);
		await user.save();

		fileHandel.deletefile(collection.imageURI.substring(1));

		res.json({
			message: 'Procuct deleted Sucessfully',
			statusCode: 200,
		});
	} catch (err) {
		err.status = 500;
		next(err);
	}
};
