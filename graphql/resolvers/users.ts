import { Request, Response } from 'express';
const User = require('../../models/User');
import { IUser, IUserInput } from '../../types/user';
const { ApolloError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
	Query: {
		async user<T>(parent: T, { ID }: IUser) {
			return await User.findById(ID);
		},
	},

	Mutation: {
		async registerUser<T>(
			parent: T,
			// what arguments we're expecting from input
			{ registerInput: { username, email, password } }: IUserInput
		) {
			// check if user with that email already exists in database
			// search user based on it's email property
			const oldUser = await User.findOne({ email });

			// throw error if email already in use
			if (oldUser) {
				throw new ApolloError(
					'User with that email already exists: ' + email,
					'USER_ALREADY_EXISTS'
				);
			}

			// encrypt user's password
			const salt = await bcrypt.genSalt();
			const encryptedPassword = await bcrypt.hash(password, salt);

			// create new user based on mongoose model
			const newUser: IUser = new User({
				username: username,
				email: email.toLowerCase(),
				password: encryptedPassword,
			});

			// create JWT token
			const token = jwt.sign(
				{ user_id: newUser._id, email },
				'hello', // jwt token is created based on this string
				{
					expiresIn: '1d',
				}
			);

			// attach token to user model, so we can grab it later
			newUser.token = token;

			// save user to database
			const res: any = await newUser.save();

			return {
				id: res.id,
				...res._doc,
			};
		},

		async loginUser<T>(parent: T, { loginInput: { email, password } }: any) {
			// check if user exists with email
			const user = await User.findOne({ email });

			// compare entered password with encrypted password
			if (user && (await bcrypt.compare(password, user.password))) {
				// create new token for user when they login
				const token = jwt.sign({ user_id: user._id, email }, 'hello', {
					expiresIn: '1d',
				});

				// attach token to user model
				user.token = token;

				return {
					id: user.id,
					...user._doc,
				};
			} else {
				throw new ApolloError('Incorrect password', 'INCORRECT_PASSWORD');
			}
		},

		// if (req.session) {
		// 	return req.session.destroy((err: any) => {
		// 		if (err) {
		// 			res.status(400).send('Unable to log out');
		// 		} else {
		// 			res.clearCookie('token');
		// 			res.send('Logout successful');
		// 		}
		// 	});
		// }
		// res.end();
		// console.log(req);
		// console.log(req.session);
		// async logoutUser(req: Request | any, res: Response, { session }: any) {

		// 	console.log(session);
		// 	console.log('Logout successful');
		// },

		async logoutUser(parent: any, {}: any, { req }: any) {
			console.log(req.session);
		},
	},
};
