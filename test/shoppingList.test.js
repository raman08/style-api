const chai = require('chai');
const chaiArrays = require('chai-arrays');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { dbConnect, dbDisconnect } = require('../utils/test-utils/dbHandler');
const app = require('../app.test');
const { createTestCollectionFile } = require('../utils/test-utils/file');

const User = require('../models/user');
const ShoppingList = require('../models/shoppingList');

const expect = chai.expect;

let accessToken;

chai.use(chaiArrays);

describe('Shopping List Module', () => {
	before(async () => {
		createTestCollectionFile();
		dbConnect();

		const user2 = User({
			_id: '507f191e810c19729de860eb',
			name: 'Test User',
			phoneNo: '2223334446',
			password:
				'$2b$12$ejEFE987KveqkCRsHMxUUurTFiY6TqBw/U0Rd7Qp8uqmO9Uon.1YK', //tester1234
			age: '19',
			gender: 'Female',
		});

		await user2.save();

		const expireAt = new Date();
		expireAt.setSeconds(expireAt.getSeconds() + 3600);

		accessToken = jwt.sign(
			{ id: '507f191e810c19729de860eb', phoneNo: '2223334446' },
			'This_is_a_super_secert_dont_tell_anyOne',
			{ expiresIn: '1h' }
		);

		const list1 = ShoppingList({
			_id: '60fc54b37bb0a455e66cfcaa',
			userId: '507f191e810c19729de860eb',
			title: 'List 1',
			items: ['Item 1', 'Item 2'],
		});
		const list2 = ShoppingList({
			_id: '60fc54b37bb0a455e66cfcab',
			userId: '507f191e810c19729de860eb',
			title: 'List 2',
			items: ['Item 1', 'Item 2'],
		});
		const list3 = ShoppingList({
			_id: '60fc54b37bb0a455e66cfcac',
			userId: '507f191e810c19729de860eb',
			title: 'List 3',
			items: ['Item 1', 'Item 2'],
		});

		list1.save();
		list2.save();
		list3.save();

		user2.shoppingList.push(list1);
		user2.shoppingList.push(list2);
		user2.shoppingList.push(list3);

		user2.save();

		// console.log(user2);
	});

	after(async () => dbDisconnect());

	describe('Getting Shopping List', () => {
		it('Should throw an error if no token is passed', done => {
			request(app)
				.get('/user/shopping/list/all')
				.set({ Accept: 'application/json' })
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(401);
					expect(body.statusCode).to.be.eql(401);
					expect(body.message).to.equal('No access token');
					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should get all the list', done => {
			request(app)
				.get('/user/shopping/list/all')
				.set({
					Accept: 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(200);

					expect(body).to.have.a.property('statusCode');
					expect(body.statusCode).to.be.eql(200);

					expect(body).to.have.a.property('message');
					expect(body.message).to.equal(
						'Shopping List fetched sucessfully'
					);

					expect(body).to.have.a.property('list');
					expect(body.list).to.be.an.array();
					expect(body.list).to.be.ofSize(3);

					expect(body.list[0]).to.have.a.property('_id');
					expect(body.list[0]).to.have.a.property('title');
					expect(body.list[0]).to.have.a.property('items');

					expect(body.list[0].items).to.be.an.array();
					expect(body.list[0].items).to.be.not.ofSize(0);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if invalid list id is provided', done => {
			request(app)
				.get('/user/shopping/list/22333eeddee')
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
						'Please enter a valid shopping list id'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no shopping list with give id is found', done => {
			request(app)
				.get('/user/shopping/list/60f92692a9505e2d40a4a3f6')
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
					expect(body.message).to.equal('No Shopping List found');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should get the shopping list if right list id is provided', done => {
			request(app)
				.get('/user/shopping/list/60fc54b37bb0a455e66cfcac')
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
						'Shopping List fetched Sucessfully'
					);

					expect(body).to.have.a.property('list');

					expect(body.list).to.have.a.property('_id');
					expect(body.list).to.have.a.property('title');
					expect(body.list).to.have.a.property('items');

					expect(body.list.items).to.be.an.array();
					expect(body.list.items).to.not.be.ofSize(0);

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	describe('Creating Shopping List', () => {
		it('Should throw an error if no access token is provide', done => {
			request(app)
				.post('/user/shopping/list/new')
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
				.post('/user/shopping/list/new/')
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
					expect(body.errors).to.be.ofSize(2);

					expect(body.errors[0]).to.have.property('message');
					expect(body.errors[0].message).to.be.equal('Invalid Title');

					expect(body.errors[1]).to.have.property('message');
					expect(body.errors[1].message).to.be.equal(
						'There must be 1 item in shopping list'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if items is empty', done => {
			request(app)
				.post('/user/shopping/list/new/')
				.send({
					title: 'Test',
					items: [],
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
						'There must be 1 item in shopping list'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should create an list if everything is rignt', done => {
			request(app)
				.post('/user/shopping/list/new/')
				.send({
					title: 'Test',
					items: ['Test Item 1', 'Test Item 2'],
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
						'Shopping List Created Sucessfully'
					);

					expect(body).to.have.a.property('list');

					expect(body.list).to.have.a.property('_id');

					expect(body.list).to.have.a.property('title');
					expect(body.list.title).to.be.equal('Test');

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	describe('Updaing Shopping List', () => {
		it('Should throw an error if no access token is provide', done => {
			request(app)
				.put('/user/shopping/list/update/60f69191626e3ef4a8b83185')
				.set({
					Accept: 'application/json',
					// Authorization: `Bearer ${accessToken}`,
				})
				.then(res => {
					const body = res.body;

					// console.log(body);

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

		it('Should throw an error if invalid list id is provided', done => {
			request(app)
				.put('/user/shopping/list/update/22333eeddee')
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
						'Please enter a valid shopping list id'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no shopping list with give id is found', done => {
			request(app)
				.get('/user/shopping/list/60f92692a9505e2d40a4a3f6')
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
					expect(body.message).to.equal('No Shopping List found');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no data is provided while updating', done => {
			request(app)
				.put('/user/shopping/list/update/60fc54b37bb0a455e66cfcac/')
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
					expect(body.errors).to.be.ofSize(2);

					expect(body.errors[0]).to.have.property('message');
					expect(body.errors[0].message).to.be.equal('Invalid Title');

					expect(body.errors[1]).to.have.property('message');
					expect(body.errors[1].message).to.be.equal(
						'There must be 1 item in shopping list'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if items is empty while updating', done => {
			request(app)
				.put('/user/shopping/list/update/60fc54b37bb0a455e66cfcac')
				.send({
					title: 'Test',
					items: [],
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
						'There must be 1 item in shopping list'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should update the shopping list if right list id is provided', done => {
			request(app)
				.put('/user/shopping/list/update/60fc54b37bb0a455e66cfcac')
				.set({
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				})
				.send({
					title: 'Test Updated',
					items: ['Test Item 1', 'Test Item 2'],
				})
				.then(res => {
					const body = res.body;

					// console.log(body);

					expect(res.statusCode).to.be.eql(201);

					expect(body).to.have.property('statusCode');
					expect(body.statusCode).to.be.eql(201);

					expect(body).to.have.property('message');
					expect(body.message).to.equal('List Updated Sucessfully');

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
				.delete('/user/shopping/list/delete/60f92692a9505e2d40a4a3f2')
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

		it('Should throw an error if invalid shopping list id is provided', done => {
			request(app)
				.delete('/user/shopping/list/delete/22333eeddee')
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
						'Please enter a valid shopping list id'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should throw an error if no list with given list id is found', done => {
			request(app)
				.delete('/user/shopping/list/delete/60f92692a9505e2d40a4a3f6')
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
					expect(body.message).to.equal('No shopping list found');

					done();
				})
				.catch(err => {
					done(err);
				});
		});

		it('Should delete the collection if right collection id is provided', done => {
			request(app)
				.delete('/user/shopping/list/delete/60fc54b37bb0a455e66cfcac')
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
					expect(body.message).to.equal('List Deleted Sucessfully');

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});
});
