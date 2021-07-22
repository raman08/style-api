const multer = require('multer');

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `images/collections/`);
	},
	filename: (req, file, cb) => {
		// console.log(file);
		cb(
			null,
			`Collection_${req.user._id}_${Date.now()}.${
				file.mimetype.split('/')[1]
			}`
		);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
		const error = new Error('File formate not supported');
		error.status = 401;
		return cb(error, false);
	}
};

exports.multerCollectionImage = multer({
	storage: fileStorage,
	fileFilter: fileFilter,
}).single('collectionImage');

// exports.checkCollectionFile = (req, res, next) => {
// 	if (!req.file) {
// 		return res.status(400).json({
// 			message: 'Invalid Data',
// 			errors: [
// 				{
// 					message: 'No image file found',
// 					value: '',
// 					param: 'collectionImage',
// 				},
// 			],
// 			statusCode: 400,
// 		});
// 	}
// };
