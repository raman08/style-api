const path = require('path');

const chai = require('chai');
const chaiArrays = require('chai-arrays');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { dbConnect, dbDisconnect } = require('../utils/test-utils/dbHandler');
const app = require('../app.test');
const { createTestCollectionFile } = require('../utils/test-utils/file');

const User = require('../models/user');
const Collection = require('../models/userCollection');

const expect = chai.expect;

let accessToken;

chai.use(chaiArrays);

describe('Collection  Module', () => {
	before(async () => {
		createTestCollectionFile();
		dbConnect();

		// const user1 = User({
		// 	_id: '507f191e810c19729de860ea',
		// 	name: 'Test User',
		// 	phoneNo: '2223334445',
		// 	password:
		// 		'$2b$12$ejEFE987KveqkCRsHMxUUurTFiY6TqBw/U0Rd7Qp8uqmO9Uon.1YK', //tester1234
		// 	age: '18',
		// 	gender: 'Male',
		// });

		const user2 = User({
			_id: '507f191e810c19729de860eb',
			name: 'Test User',
			phoneNo: '2223334446',
			password:
				'$2b$12$ejEFE987KveqkCRsHMxUUurTFiY6TqBw/U0Rd7Qp8uqmO9Uon.1YK', //tester1234
			age: '19',
			gender: 'Female',
		});

		// await user1.save();
		await user2.save();

		const expireAt = new Date();
		expireAt.setSeconds(expireAt.getSeconds() + 3600);

		accessToken = jwt.sign(
			{ id: '507f191e810c19729de860eb', phoneNo: '2223334446' },
			'This_is_a_super_secert_dont_tell_anyOne',
			{ expiresIn: '1h' }
		);

		const collection1 = Collection({
			_id: '60f92692a9505e2d40a4a3f2',
			category: 'Jenes',
			imageURI: '/images/collections/test/collection_test_dest1.jpeg',
			brand: 'Jenes 1',
			userId: '507f191e810c19729de860eb',
		});

		const collection2 = Collection({
			_id: '60f92692a9505e2d40a4a3f3',
			category: 'Jenes',
			imageURI: '/images/collections/test/collection_test_dest2.jpeg',
			brand: 'Jenes 2',
			userId: '507f191e810c19729de860eb',
		});

		const collection3 = Collection({
			_id: '60f92692a9505e2d40a4a3f4',
			category: 'Shirt',
			imageURI: '/images/collections/test/collection_test_dest3.jpeg',
			brand: 'Shirt 1',
			userId: '507f191e810c19729de860eb',
		});

		const collection4 = Collection({
			_id: '60f92692a9505e2d40a4a3f5',
			category: 'Shirt',
			imageURI: '/images/collections/test/collection_test_dest4.jpeg',
			brand: 'Shirt 2',
			userId: '507f191e810c19729de860eb',
		});

		await collection1.save();
		await collection2.save();
		await collection3.save();
		await collection4.save();

		user2.collections.push(collection1);
		user2.collections.push(collection2);
		user2.collections.push(collection3);
		user2.collections.push(collection4);

		user2.save();
	});

	after(async () => dbDisconnect());

	describe('Getting Collections', () => {
		it('Should throw an error if no token is passed', done => {
			request(app)
				.get('/user/collection')
				.set({ Accept: 'application/json' })
				.then(res => {
					const body = res.body;

					expect(res.statusCode).to.be.eql(401);
					expect(body.statusCode).to.be.eql(401);
					expect(body.message).to.equal('No access token');
					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should get all the collection if no query parameter is passed', done => {
			request(app)
				.get('/user/collection')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					expect(res.statusCode).to.be.eql(200);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(200);

					expect(body).to.have.property('message');
					expect(body.message).to.equal(
						'Collection Fetched Sucessfully'
					);

					expect(body).to.have.property('collections');
					expect(body.collections).to.be.array();
					expect(body.collections).to.be.ofSize(4);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should get only Shirt if query parameter of Shirt is passes', done => {
			request(app)
				.get('/user/collection')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.query({ category: 'Shirt' })
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(200);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(200);

					expect(body).to.have.property('message');
					expect(body.message).to.equal(
						'Collection Fetched Sucessfully'
					);

					expect(body).to.have.property('collections');
					expect(body.collections).to.be.array();
					expect(body.collections).to.be.ofSize(2);

					expect(body.collections[1].category).to.be.equal('Shirt');

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	describe('Creating Collections', () => {
		it('Should throw an error if no access token is provide', done => {
			request(app)
				.post('/user/collection/new')
				.set({
					Accept: 'application/json',
					// Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					expect(res.statusCode).to.be.eql(401);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(401);

					expect(body).to.have.property('message');
					expect(body.message).to.equal('No access token');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no data is provided', done => {
			request(app)
				.post('/user/collection/new/')
				.field('category', '')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(res.body);

					expect(res.statusCode).to.be.eql(400);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(400);

					expect(body).to.have.a.property('message');
					expect(body.message).to.be.equal('Invalid Data');

					expect(body).to.have.property('errors');
					expect(body.errors).to.be.array();
					expect(body.errors).to.be.ofSize(3);

					expect(body.errors[0]).to.have.property('message');
					expect(body.errors[0].message).to.be.equal(
						'Should Only contain the alphanumeric chracters'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if image is not provide ', done => {
			request(app)
				.post('/user/collection/new/')
				.field('category', 'Test Shoes')
				.field('brand', 'Test Shoes brand')
				// .attach(
				// 	'collectionImage',
				// 	fs.createReadStream(
				// 		'../test-files/test_collection.image_type.txt'
				// 	)
				// )
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(res.body);

					expect(res.statusCode).to.be.eql(400);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(400);

					expect(body).to.have.a.property('message');
					expect(body.message).to.be.equal('Invalid Data');

					expect(body).to.have.property('errors');
					expect(body.errors).to.be.array();
					expect(body.errors).to.be.ofSize(1);

					expect(body.errors[0]).to.have.property('message');
					expect(body.errors[0].message).to.be.equal(
						'No image file found'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if image is not provide in right formate', done => {
			const filepath = path.join(
				__dirname,
				'..',
				'images',
				'collections',
				'test',
				'test.txt'
			);

			request(app)
				.post('/user/collection/new/')
				.field('category', 'Test Shoes')
				.field('brand', 'Test Shoes brand')
				.attach('collectionImage', filepath)
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(res.body);

					expect(res.statusCode).to.be.eql(401);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(401);

					expect(body).to.have.a.property('message');
					expect(body.message).to.be.equal(
						'File formate not supported'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should create an product if everything is rignt', done => {
			const filepath = path.join(
				__dirname,
				'..',
				'images',
				'collections',
				'test',
				'test.jpeg'
			);

			request(app)
				.post('/user/collection/new/')
				.field('category', 'Test Shoes')
				.field('brand', 'Test Shoes brand')
				.attach('collectionImage', filepath)
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(res.body);

					expect(res.statusCode).to.be.eql(201);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(201);

					expect(body).to.have.a.property('message');
					expect(body.message).to.be.equal(
						'Collection saved Sucessfully'
					);

					expect(body).to.have.a.property('collection');

					expect(body.collection).to.have.a.property('category');
					expect(body.collection.category).to.be.equal('Test Shoes');

					expect(body.collection).to.have.a.property('brand');
					expect(body.collection.brand).to.be.equal(
						'Test Shoes brand'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	describe('Deleting Collections', () => {
		it('Should throw an error if no access token is provide', done => {
			request(app)
				.delete('/user/collection/delete/60f92692a9505e2d40a4a3f2')
				.set({
					Accept: 'application/json',
					// Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(res.body);

					expect(res.statusCode).to.be.eql(401);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(401);

					expect(body).to.have.property('message');
					expect(body.message).to.equal('No access token');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if invalid collection is provided', done => {
			request(app)
				.delete('/user/collection/delete/22333eeddee')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.query({ category: 'Shirt' })
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(400);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(400);

					expect(body).to.have.property('errors');

					expect(body.errors).to.be.array();

					expect(body.errors[0]).to.have.a.property('message');

					expect(body.errors[0].message).to.be.equal(
						'Please enter a valid collection id'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no collection is found', done => {
			request(app)
				.delete('/user/collection/delete/60f92692a9505e2d40a4a3f6')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(404);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(404);

					expect(body).to.have.property('message');
					expect(body.message).to.equal('No Collection Found');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should delete the collection if right collection id is provided', done => {
			request(app)
				.delete('/user/collection/delete/60f92692a9505e2d40a4a3f5')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(200);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(200);

					expect(body).to.have.property('message');
					expect(body.message).to.equal(
						'Procuct deleted Sucessfully'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});
});
