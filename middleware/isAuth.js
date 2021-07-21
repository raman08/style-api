const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) {
		req.isAuth = false;
		return res
			.status(401)
			.json({ message: 'No access token', statusCode: 401 });
	}

	let decodedToken;
	try {
		decodedToken = jwt.verify(token, process.env.JWT_SECERET);
	} catch (err) {
		req.isAuth = false;

		console.log(err);

		if (err instanceof jwt.TokenExpiredError) {
			return res.status(401).send({
				message: 'Access Token was expired!',
				statusCode: 401,
			});
		}

		return res
			.status(403)
			.json({ message: 'Token not valid', statusCode: 403 });
	}

	if (!decodedToken) {
		req.isAuth = false;
		return res
			.status(403)
			.json({ message: 'Token not valid', statusCode: 403 });
	}

	req.isAuth = true;
	req.user = { _id: decodedToken.id, phoneNo: decodedToken.phoneNo };
	next();
};
