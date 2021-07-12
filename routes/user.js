const express = require('express');
const multer = require('multer');

const userController = require('../controllers/user');
const router = express.Router();
const { isAuth } = require('../middleware/isAuth');
const { multerCollectionImage } = require('../middleware/multerUtil');

router.get('/collection/', isAuth, userController.getUserCollection);

router.post(
	'/collection/new',
	isAuth,
	multerCollectionImage,
	userController.postUserCollection
);

router.delete(
	'/collection/delete/:collectionId',
	isAuth,
	userController.deleteUserCollection
);

module.exports = router;
