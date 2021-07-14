const { expect } = require('chai');
const request = require('supertest');

const { dbConnect, dbDisconnect } = require('../utils/test-utils/dbHandler');
const app = require('../app.test');

const User = require('../models/user');

describe('Authentication Module', () => {
	before(async () => {
		dbConnect();

		const user = User({
			_id: '507f191e810c19729de860ea',
			name: 'Test User',
			phoneNo: '2223334445',
			password: 'tester1234',
			age: '18',
			gender: 'Male',
		});

		await user.save();
	});
	after(async () => dbDisconnect());

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
					expect(res.body.errors[0].error).is.equal('Invalid Gender');
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
					expect(res.body.errors[0].error).is.equal('Invalid Age');
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
					expect(res.body.errors[0].error).is.equal(
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
					expect(res.body.errors[0].error).is.equal(
						'User already register with this phone number. Sign In instead?'
					);
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
					password: 'test2',
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
	});
});
