const Collection = require('../models/userCollection');
const User = require('../models/user');
const fileHandel = require('../utils/file');

// ##########
// 		Controller to Get All the collection of particular user or filter by category
//
//		Required => (Optional - query parameter) category: category filter
//
// ##########
exports.getUserCollection = async (req, res, next) => {
	const category = req.query.category;
	console.log(category);

	if (!req.isAuth) {
		return res.status(401).json({
			message: 'User not authorized. Please Signin to view resourse',
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
				user: collection.userId,
				imageURI: collection.imageURI,
			};
		});

		res.json({ collections: collectionsData });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
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
	const { category, brand } = req.body;
	const collectionImage = req.file;

	console.log('File:', collectionImage);

	if (!req.isAuth) {
		return res.status(401).json({
			message: 'User not authorized. Please Signin to view resourse',
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
		const updatedUser = await user.save();

		res.status(201).json({
			messsage: 'Collection saved Sucessfully',
			collection: collection,
			user: updatedUser,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

// ##########
// 		Controller to delete the user Collection
//
//		Required =>  collectionId (as url parameter): id of the colleciton document to be deleted
//
// ##########
exports.deleteUserCollection = async (req, res, next) => {
	const collectionId = req.params.collectionId;
	try {
		const user = await User.findById(req.user._id);
		const collection = await Collection.findById(collectionId);

		if (!collection) {
			return res.status(404).json({ message: 'No Collection Found' });
		}

		await Collection.deleteOne({ _id: collectionId, userId: req.user._id });

		user.collections.pull(collectionId);
		await user.save();

		fileHandel.deletefile(collection.imageURI.substring(1));

		res.json({
			message: 'Procuct deleted Sucessfully',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};
