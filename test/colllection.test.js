const { expect } = require('chai');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { dbConnect, dbDisconnect } = require('../utils/test-utils/dbHandler');
const app = require('../app.test');

const User = require('../models/user');
const RefreshToken = require('../models/userRefershToken');

let accessToken;

describe('Collection  Module', () => {
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

		accessToken = jwt.sign(
			{ id: '507f191e810c19729de860eb', phoneNo: '2223334446' },
			'This_is_a_super_secert_dont_tell_anyOne',
			{ expiresIn: '1h' }
		);
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
					expect(body.statusCode).to.be.eql(200);
					expect(body.message).to.equal(
						'Collection Fetched Sucessfully'
					);

					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});
});
