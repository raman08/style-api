const express = require('express');
const multer = require('multer');

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
	collectionController.postUserCollection
);

router.delete(
	'/collection/delete/:collectionId',
	isAuth,
	collectionController.deleteUserCollection
);

// ################################### Looks Routes ##########################################
router.get('/looks', isAuth, looksController.getLooks);

router.post('/looks/new', isAuth, looksController.postLook);

router.delete('/looks/delete/:lookId', isAuth, looksController.deleteLook);

// ################################ Shopping List Routes ##########################

router.get('/shopping/list/all', isAuth, listController.getLists);

router.post('/shopping/list/new', isAuth, listController.postList);

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
