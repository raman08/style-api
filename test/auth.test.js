const { expect } = require('chai');
const request = require('supertest');

const { dbConnect, dbDisconnect } = require('../utils/test-utils/dbHandler');
const app = require('../app.test');

const User = require('../models/user');
const RefreshToken = require('../models/userRefershToken');

describe('Authentication Module', () => {
	before(async () => {
		dbConnect();

		const user1 = User({
			_id: '507f191e810c19729de860ea',
			name: 'Test User',
			phoneNo: '2223334445',
			password:
				'$2b$12$ejEFE987KveqkCRsHMxUUurTFiY6TqBw/U0Rd7Qp8uqmO9Uon.1YK', //tester1234
			age: '18',
			gender: 'Male',
		});

		const user2 = User({
			_id: '507f191e810c19729de860eb',
			name: 'Test User',
			phoneNo: '2223334446',
			password:
				'$2b$12$ejEFE987KveqkCRsHMxUUurTFiY6TqBw/U0Rd7Qp8uqmO9Uon.1YK', //tester1234
			age: '19',
			gender: 'Female',
		});

		await user1.save();
		await user2.save();

		const expireAt = new Date();
		expireAt.setSeconds(expireAt.getSeconds() + 3600);

		const userRefresh = RefreshToken({
			token: 'abd48c28-351a-4372-9d87-5153b2dc5d7f',
			userId: '507f191e810c19729de860eb',
			expiresAt: expireAt,
		});

		await userRefresh.save();
	});

	after(async () => dbDisconnect());

	// ##########
	// 		Test to verify the opt service
	//
	// ##########
	describe('Verification Service Test', () => {
		it('Give error if wrong phone number is given', done => {
			request(app)
				.post('/auth/verify')
				.send({ phoneNo: 9122233344455 })
				.set('Accept', 'application/json')
				.then(res => {
					const body = res.body;
					expect(res.statusCode).to.be.eql(400);
					expect(body.statusCode).to.be.eql(400);
					expect(body.errors[0].message).to.equal(
						'Invalid Phone Number'
					);
					done();
				})
				.catch(err => {
					done(err);
				});
		});

		// it('Send otp if right phone number is given', done => {
		// 	request(app)
		// 		.post('/auth/verify')
		// 		.send({ phoneNo: 917347501113 })
		// 		.set('Accept', 'application/json')
		// 		.then(res => {
		// 			const body = res.body;
		// 			expect(res.statusCode).to.be.eql(200);
		// 			expect(body.data.statusCode).to.be.eql(200);
		// 			expect(body.message).to.equal('Otp Send Sucessfully');
		// 			done();
		// 		})
		// 		.catch(err => {
		// 			done(err);
		// 		});
		// });
	});

	// ##########
	// 		Test to verify the singup service
	//
	// ##########
	describe('Verifing Signup Service', () => {
		it('Should throw an error if gender is not male/female/prefer not to say', done => {
			request(app)
				.post('/auth/user/signup')
				.send({
					name: '__Name_>;;?',
					phoneNo: '7347501112',
					password: 'test2222',
					age: '18',
					gender: 'Hello',
				})
				.set('Accept', 'application/json')
				.then(res => {
					expect(res.statusCode).to.be.eql(400);
					expect(res.body).to.have.a.property('errors');
					expect(res.body.errors[0].message).is.equal(
						'Invalid Gender'
					);
					done();
				})
				.catch(err => done(err));
		});

		it('Should throw an error if age is not a number', done => {
			request(app)
				.post('/auth/user/signup')
				.send({
					name: '__Name_>;;?',
					phoneNo: '7347501112',
					password: 'test2222',
					age: '18e',
					gender: 'Male',
				})
				.set('Accept', 'application/json')
				.then(res => {
					expect(res.statusCode).to.be.eql(400);
					expect(res.body).to.have.a.property('errors');
					expect(res.body.errors[0].message).is.equal('Invalid Age');
					done();
				})
				.catch(err => done(err));
		});

		it('Should throw an error if password is less then eight digit', done => {
			request(app)
				.post('/auth/user/signup')
				.send({
					name: 'Test',
					phoneNo: '7347501112',
					password: 'test2',
					age: '18',
					gender: 'Male',
				})
				.set('Accept', 'application/json')
				.then(res => {
					expect(res.statusCode).to.be.eql(400);
					expect(res.body).to.have.a.property('errors');
					expect(res.body.errors[0].message).is.equal(
						'Password should be minimum eight chracters'
					);
					done();
				})
				.catch(err => done(err));
		});

		it('Should throw an error if repeated number is used for signup', done => {
			request(app)
				.post('/auth/user/signup')
				.send({
					name: 'Test',
					phoneNo: '2223334445',
					password: 'test223344',
					age: '18',
					gender: 'Male',
				})
				.set('Accept', 'application/json')
				.then(res => {
					expect(res.statusCode).to.be.eql(400);
					expect(res.body).to.have.a.property('errors');
					expect(res.body.errors[0].message).is.equal(
						'User already register with this phone number. Sign In instead?'
					);
					done();
				})
				.catch(err => done(err));
		});

		it('Signup user correctly if details are right', done => {
			request(app)
				.post('/auth/user/signup')
				.send({
					name: 'Test User 2',
					phoneNo: '3334445556',
					password: 'test2990',
					age: '18',
					gender: 'Male',
				})
				.set('Accept', 'application/json')
				.then(res => {
					expect(res.statusCode).to.be.eql(201);
					expect(res.body).to.have.a.property('message');
					expect(res.body.message).is.equal(
						'User register sucessfully!'
					);

					expect(res.body).to.have.a.property('user');
					expect(res.body.user).to.have.a.property('_id');
					expect(res.body.user).to.have.a.property('name');

					done();
				})
				.catch(err => done(err));
		});
	});

	describe('Verifying Signin Service', () => {
		it('Should throw an error if use wrong password', done => {
			request(app)
				.post('/auth/user/signin/password')
				.send({
					phoneNo: '2223334445',
					password: 'tester1',
				})
				.set('Accept', 'application/json')
				.then(res => {
					expect(res.statusCode).to.be.eql(401);
					expect(res.body).to.have.a.property('message');
					expect(res.body.message).is.equal('Invalid Password!');
					done();
				})
				.catch(err => done(err));
		});

		it('Should give access token and refresh-token when used right credentials', done => {
			request(app)
				.post('/auth/user/signin/password')
				.send({
					phoneNo: '2223334445',
					password: 'tester1234',
				})
				.set('Accept', 'application/json')
				.then(async res => {
					expect(res.statusCode).to.be.eql(200);

					expect(res.body).to.have.a.property('user');
					expect(res.body.user).to.have.a.property('id');
					expect(res.body.user).to.have.a.property('phoneNo');
					expect(res.body).to.have.a.property('accessToken');
					expect(res.body).to.have.a.property('refreshToken');
					done();
				})
				.catch(err => done(err));
		});

		it('Should Throw an error if refresh token is wrong', done => {
			request(app)
				.post('/auth/user/signin/refresh')
				.send({
					refreshToken: 'abd48c28-351a-4372-9d87-5153b2dc5e7f',
				})
				.set('Accept', 'application/json')
				.then(async res => {
					expect(res.statusCode).to.be.eql(403);

					expect(res.body).to.have.a.property('message');
					expect(res.body.message).is.equal('Invalid Refresh Token!');

					done();
				})
				.catch(err => done(err));
		});

		it('Should give us access token if refresh token is valid', done => {
			request(app)
				.post('/auth/user/signin/refresh')
				.send({
					refreshToken: 'abd48c28-351a-4372-9d87-5153b2dc5d7f',
				})
				.set('Accept', 'application/json')
				.then(async res => {
					expect(res.statusCode).to.be.eql(200);

					expect(res.body).to.have.a.property('message');
					expect(res.body.message).is.equal(
						'Access Token generated!'
					);

					expect(res.body).to.have.a.property('accessToken');
					expect(res.body).to.have.a.property('refreshToken');

					expect(res.body.refreshToken).to.be.equal(
						'abd48c28-351a-4372-9d87-5153b2dc5d7f'
					);

					done();
				})
				.catch(err => done(err));
		});
	});
});
