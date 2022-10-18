import { NextFunction, Request, Response } from 'express';

const jwt = require('jsonwebtoken');

module.exports = function (
	req: Request | any,
	res: Response,
	next: NextFunction
) {
	const token = req.header('auth-token');
	if (!token) return res.status(401).send('access denied');

	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.status(400).send('invalid token');
	}
};
