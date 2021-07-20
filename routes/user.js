const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');

const collectionController = require('../controllers/collection');
const looksController = require('../controllers/looks');
const listController = require('../controllers/shopplingList');
const { isAuth } = require('../middleware/isAuth');
const { multerCollectionImage } = require('../middleware/multerUtil');

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
	collectionController.postUserCollection
);

router.delete(
	'/collection/delete/:collectionId',
	isAuth,
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
			.withMessage('There must be 1 clothing in the look'),
	],
	looksController.postLook
);

router.delete('/looks/delete/:lookId', isAuth, looksController.deleteLook);

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

router.post(
	'/shopping/list/update/:listId',
	isAuth,
	listController.postUpdateList
);

module.exports = router;
