// resolvers are functionalities that we can use to modify out typeDefs
const Book = require('../models/Book');
const User = require('../models/User');
import { IBook, IBookArgs, IBookInput } from '../types/book';
const { ApolloError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
	Query: {
		// async book(_, { ID }) {

		// get ID from args using destructuring
		// async book(parent, { ID }: TBook) {
		async book<T>(parent: T, { ID }: IBook) {
			// search book in our database with mongoose
			return await Book.findById(ID);
		},
		async getBooks<T>(parent: T, { amount }: IBookArgs) {
			return await Book.find()
				.sort({
					// sort ascending lastModified: -1,
					// sort descending lastModified: 1,
					lastModified: -1,
				})
				// show only amount of books
				.limit(amount);
		},
		async user<T>(parent: T, { ID }: any) {
			return await User.findById(ID);
		},
	},

	Mutation: {
		async createBook<T>(
			parent: T,
			{ bookInput: { author, pages, rating, status, title } }: IBookInput
		) {
			// create mongoose model
			const createdBook = new Book({
				author: author,
				lastModified: new Date().toISOString(),
				pages: pages,
				rating: rating,
				status: status,
				title: title,
			});

			// save to MongoDB
			const res = await createdBook.save();
			console.log(res._doc);

			// return book to apollo server resolver
			return {
				id: res.id,
				...res._doc,
			};
		},

		async deleteBook<T>(parent: T, { ID }: IBook) {
			const wasDeleted = (
				await Book.deleteOne({
					// delete book based on _id coming from MongoDB
					_id: ID,
				})
			).deletedCount;
			// deletedCount will return 1 if we deleted book or 0 if nothing was deleted
			return wasDeleted;
		},

		async editBook<T>(
			parent: T,
			{ ID, bookInput: { author, pages, rating, status, title } }: IBookInput
		) {
			// updateOne has 2 parameters
			// first is filter, how we want to update our book, we want to update it based on it's ID
			// second is what we want to update, we want to update fields that we'll pass in our input
			const wasEdited = (
				await Book.updateOne(
					{
						_id: ID,
					},
					{
						author: author,
						pages: pages,
						rating: rating,
						status: status,
						title: title,
					}
				)
			).modifiedCount;
			return wasEdited;
		},

		async registerUser<T>(
			parent: T,
			// what arguments we're expecting from input
			{ registerInput: { username, email, password } }: any
		) {
			/* Do input validation
            if (!(email && password && first_name && last_name)) {
                res.status(400).send("All input is required");
            }
            */

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
			const newUser = new User({
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
			const res = await newUser.save();

			return {
				id: res.id,
				...res._doc,
			};
		},

		async loginUser<T>(parent: T, { loginInput: { email, password } }: any) {
			/* Do input validation
            if (!(email && password)) {
                res.status(400).send("All input is required");
            }
            */
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
	},
};
