require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// const client = require('twilio')(
// 	process.env.TWILIO_ACCOUNT_SID,
// 	process.env.TWILIO_AUTH_TOKEN
// );

const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // Connecting to database
// mongoose
// 	.connect(process.env.MONGO_URI, {
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 	})
// 	.then(() => {
// 		console.log('Connected to database');
// 	})
// 	.catch(err => {
// 		console.log(err);
// 	});

// authentication routes
app.use('/auth', authRoutes);

// User Routes
app.use('/user', userRoutes);

app.use((req, res, next) => {
	var err = new Error('Route not found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		message: err.message,
		statusCode: err.status,
	});
});

module.exports = app;
