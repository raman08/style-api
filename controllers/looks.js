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
		const looks = await Look.find(filterQuery)
			.populate('clothings', '_id category brand imageURI')
			.exec();

		res.json({ looks });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.postLook = async (req, res, next) => {
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

		const collections = [];

		await look.save();

		clothings.forEach(async cloth => {
			const collection = await Collection.findById(cloth);
			collection.looks.push(look._id);
			await collection.save();
		});

		user.looks.push(look._id);

		const savedUser = await user.save();

		res.status(201).json({
			message: 'Look created sucessfully!',
			look,
			savedUser,
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
