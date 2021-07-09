require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connecting to database
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Connected to database');
	})
	.catch(err => {
		console.log(err);
	});

// Adding authentication routes
app.use('/auth', authRoutes);

// Starting the server
app.listen(3000, () =>
	console.log('[App.js] Server Started at http://localhost:3000')
);
