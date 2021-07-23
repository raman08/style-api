const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const ObjectID = require('mongodb').ObjectID;

const collectionController = require('../controllers/collection');
const looksController = require('../controllers/looks');
const listController = require('../controllers/shopplingList');
const { isAuth } = require('../middleware/isAuth');
const { multerCollectionImage } = require('../middleware/multerUtil');

const Collection = require('../models/userCollection');

const router = express.Router();

// ################## Collection Routes ########################
router.get('/collection/', isAuth, collectionController.getUserCollection);

router.post(
	'/collection/new',
	isAuth,
	multerCollectionImage,
	[
		body('category')
			.trim()
			.isAscii()
			.withMessage('Should Only contain the alphanumeric chracters'),
		body('brand')
			.trim()
			.isAscii()
			.withMessage('Should Only contain the alphanumeric chracters'),
	],
	// checkCollectionFile,

	collectionController.postUserCollection
);

router.delete(
	'/collection/delete/:collectionId',
	isAuth,
	[
		param('collectionId').custom((value, { req }) => {
			if (!ObjectID.isValid(value)) {
				throw new Error('Please enter a valid collection id');
			}
			return true;
		}),
	],
	collectionController.deleteUserCollection
);

// ################################### Looks Routes ##########################################
router.get('/looks', isAuth, looksController.getLooks);

router.post(
	'/looks/new',
	isAuth,
	[
		body('type').isAscii().withMessage('Invalid Type'),
		body('name').isAscii().withMessage('Invalid Name'),
		body('clothings')
			.isArray({ min: 1 })
			.withMessage('There must be 1 clothing in the look')
			.custom(value => {
				if (value) {
					value.forEach(cloth => {
						if (!ObjectID.isValid(cloth)) {
							throw new Error('Invalid clothing ID');
						}
						return true;
					});

					// value.forEach(async cloth => {
					// 	const clothDoc = await Collection.findById(cloth);

					// 	if (!clothDoc) {
					// 		throw new Error(
					// 			'Collection contanning the id is not found'
					// 		);
					// 	}

					// 	return true;
					// });

					return true;
				}
				return true;
			}),
	],
	looksController.postLook
);

router.delete(
	'/looks/delete/:lookId',
	isAuth,
	[
		param('lookId').custom((value, { req }) => {
			if (!ObjectID.isValid(value)) {
				throw new Error('Please enter a valid look id');
			}
			return true;
		}),
	],
	looksController.deleteLook
);

// ################################ Shopping List Routes ##########################

router.get('/shopping/list/all', isAuth, listController.getLists);

router.post(
	'/shopping/list/new',
	isAuth,
	[
		body('title').isAscii().withMessage('Invalid Title'),
		body('items')
			.isArray({ min: 1 })
			.withMessage('There must be 1 item in shopping list'),
	],
	listController.postList
);

router.get('/shopping/list/:listId', isAuth, listController.getList);

router.delete(
	'/shopping/list/delete/:listId',
	isAuth,
	listController.deleteList
);

router.put(
	'/shopping/list/update/:listId',
	isAuth,
	listController.postUpdateList
);

module.exports = router;
