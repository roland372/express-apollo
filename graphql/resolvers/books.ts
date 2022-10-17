// resolvers are functionalities that we can use to modify out typeDefs
const Book = require('../../models/Book');
import { IBook, IBookArgs, IBookInput } from '../../types/book';

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
	},
};
