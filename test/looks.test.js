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
const Look = require('../models/looks');

const expect = chai.expect;

let accessToken;

chai.use(chaiArrays);

describe('Looks Module', () => {
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

		const look1 = Look({
			_id: '60fa7bb5332bbe25f07eafd0',
			type: 'Casual',
			name: 'Casual 1',
			clothings: ['60f92692a9505e2d40a4a3f2', '60f92692a9505e2d40a4a3f4'],
			userId: '507f191e810c19729de860eb',
		});

		const look2 = Look({
			_id: '60fa7bb5332bbe25f07eafd1',
			type: 'Casual',
			name: 'Casual 2',
			clothings: ['60f92692a9505e2d40a4a3f3', '60f92692a9505e2d40a4a3f5'],
			userId: '507f191e810c19729de860eb',
		});

		const look3 = Look({
			_id: '60fa7bb5332bbe25f07eafd2',
			type: 'Party',
			name: 'Party 1',
			clothings: ['60f92692a9505e2d40a4a3f2', '60f92692a9505e2d40a4a3f5'],
			userId: '507f191e810c19729de860eb',
		});

		const look4 = Look({
			_id: '60fa7bb5332bbe25f07eafd3',
			type: 'Party',
			name: 'Party 2',
			clothings: ['60f92692a9505e2d40a4a3f3', '60f92692a9505e2d40a4a3f4'],
			userId: '507f191e810c19729de860eb',
		});

		await look1.save();
		await look2.save();
		await look3.save();
		await look4.save();

		user2.looks.push(look1);
		user2.looks.push(look2);
		user2.looks.push(look3);
		user2.looks.push(look4);

		user2.save();

		// console.log(user2);
	});

	after(async () => dbDisconnect());

	describe('Getting Looks', () => {
		it('Should throw an error if no token is passed', done => {
			request(app)
				.get('/user/looks')
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
				.get('/user/looks')
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
					expect(body.message).to.equal('Looks fetched Sucessfully');

					expect(body).to.have.property('looks');
					expect(body.looks).to.be.array();
					expect(body.looks).to.be.ofSize(4);

					expect(body.looks[0]).to.have.property('_id');
					expect(body.looks[0]).to.have.property('type');
					expect(body.looks[0]).to.have.property('name');
					expect(body.looks[0]).to.have.property('clothings');

					expect(body.looks[0].clothings).to.be.an.array();
					expect(body.looks[0].clothings).not.to.ofSize(0);

					expect(body.looks[0].clothings[0]).to.have.a.property(
						'_id'
					);
					expect(body.looks[0].clothings[0]).to.have.a.property(
						'category'
					);
					expect(body.looks[0].clothings[0]).to.have.a.property(
						'brand'
					);
					expect(body.looks[0].clothings[0]).to.have.a.property(
						'imageURI'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should get only Shirt if query parameter of Shirt is passes', done => {
			request(app)
				.get('/user/looks')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.query({ type: 'Casual' })
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(200);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(200);

					expect(body).to.have.property('message');
					expect(body.message).to.equal('Looks fetched Sucessfully');

					expect(body).to.have.property('looks');
					expect(body.looks).to.be.array();
					expect(body.looks).to.be.ofSize(2);

					expect(body.looks[0]).to.have.property('_id');
					expect(body.looks[0]).to.have.property('type');
					expect(body.looks[0]).to.have.property('name');
					expect(body.looks[0]).to.have.property('clothings');

					expect(body.looks[0].type).to.be.equal('Casual');

					expect(body.looks[0].clothings).to.be.an.array();
					expect(body.looks[0].clothings).not.to.ofSize(0);

					expect(body.looks[0].clothings[0]).to.have.a.property(
						'_id'
					);
					expect(body.looks[0].clothings[0]).to.have.a.property(
						'category'
					);
					expect(body.looks[0].clothings[0]).to.have.a.property(
						'brand'
					);
					expect(body.looks[0].clothings[0]).to.have.a.property(
						'imageURI'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	describe('Creating Looks', () => {
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
				.post('/user/looks/new/')
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
					expect(body.errors[0].message).to.be.equal('Invalid Type');

					expect(body.errors[2]).to.have.property('message');
					expect(body.errors[2].message).to.be.equal(
						'There must be 1 clothing in the look'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error clothings is empty', done => {
			request(app)
				.post('/user/looks/new/')
				.send({
					type: 'Tesing',
					name: 'Test 1',
					clothings: [],
				})
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
						'There must be 1 clothing in the look'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if invalid clothing is found', done => {
			request(app)
				.post('/user/looks/new/')
				.send({
					type: 'Tesing',
					name: 'Test 2',
					clothings: ['Cloth 1'],
				})
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
						'Invalid clothing ID'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it("Should throw an error if clothing id dosen't match any collection", done => {
			request(app)
				.post('/user/looks/new/')
				.send({
					type: 'Test',
					name: 'Test name',
					clothings: [
						'60f92692a9505e2d40a4a3f9',
						'60f92692a9505e2d40a4a3f8',
					],
				})
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
					expect(body.message).to.be.equal(
						'Collection with the id not found'
					);

					expect(body).to.have.a.property('ids');
					expect(body.ids).to.be.an.array();

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should create an product if everything is rignt', done => {
			request(app)
				.post('/user/looks/new/')
				.send({
					type: 'Test',
					name: 'Test name',
					clothings: [
						'60f92692a9505e2d40a4a3f2',
						'60f92692a9505e2d40a4a3f4',
					],
				})
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
						'Look created sucessfully!'
					);

					expect(body).to.have.a.property('look');

					expect(body.look).to.have.a.property('_id');

					expect(body.look).to.have.a.property('type');
					expect(body.look.type).to.be.equal('Test');

					expect(body.look).to.have.a.property('name');
					expect(body.look.name).to.be.equal('Test name');

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	describe('Deleting Looks', () => {
		it('Should throw an error if no access token is provide', done => {
			request(app)
				.delete('/user/looks/delete/60f92692a9505e2d40a4a3f2')
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

		it('Should throw an error if invalid look id is provided', done => {
			request(app)
				.delete('/user/looks/delete/22333eeddee')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
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
						'Please enter a valid look id'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no look is found', done => {
			request(app)
				.delete('/user/looks/delete/60f92692a9505e2d40a4a3f6')
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
					expect(body.message).to.equal('No Look Found');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should delete the collection if right collection id is provided', done => {
			request(app)
				.delete('/user/looks/delete/60fa7bb5332bbe25f07eafd3')
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
					expect(body.message).to.equal('Look deleted Sucessfully');

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});
});
