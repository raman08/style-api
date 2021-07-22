const fs = require('fs');
const path = require('path');

exports.createTestCollectionFile = () => {
	const srcPath = path.join(
		__dirname,
		'..',
		'..',
		'images',
		'collections',
		'test',
		'collection_test_src.jpeg'
	);

	const destPath1 = path.join(
		__dirname,
		'..',
		'..',
		'images',
		'collections',
		'test',
		'collection_test_dest1.jpeg'
	);
	const destPath2 = path.join(
		__dirname,
		'..',
		'..',
		'images',
		'collections',
		'test',
		'collection_test_dest2.jpeg'
	);
	const destPath3 = path.join(
		__dirname,
		'..',
		'..',
		'images',
		'collections',
		'test',
		'collection_test_dest3.jpeg'
	);
	const destPath4 = path.join(
		__dirname,
		'..',
		'..',
		'images',
		'collections',
		'test',
		'collection_test_dest4.jpeg'
	);

	fs.copyFileSync(srcPath, destPath1);
	fs.copyFileSync(srcPath, destPath2);
	fs.copyFileSync(srcPath, destPath3);
	fs.copyFileSync(srcPath, destPath4);
};
