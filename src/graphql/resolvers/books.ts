import Book from '../../models/Book';
import { GraphQLError } from 'graphql';

import { IBook, IBookArgs, IBookInput } from '../../types/book';
import { TPagination } from '../../types/pagination';

import { PubSub, withFilter } from 'graphql-subscriptions';
const pubsub = new PubSub();

export const booksResolvers = {
	Query: {
		async getSingleBook<T>(parent: T, { ID }) {
			// search book in our database with mongoose
			return await Book.findById(ID);
		},

		async getAllBooks<T>(parent: T, { amount }: IBookArgs) {
			return (
				Book.find()
					.sort({
						// sort ascending lastModified: -1,
						// sort descending lastModified: 1,
						lastModified: -1,
					})
					// show only amount of books
					.limit(amount)
			);
		},

		async getSomeBooks<T>(parent: T, args: TPagination) {
			const totalBooks = await Book.countDocuments();

			const page = args.page || 1;
			const booksPerPage = args.limit || totalBooks;

			const books = await Book.find()
				.sort({
					lastModified: -1,
				})
				.skip((page - 1) * booksPerPage)
				.limit(booksPerPage);

			return { totalItems: totalBooks, books };
		},
	},
	Mutation: {
		async createBook<T>(
			parent: T,
			{ bookInput: { author, pages, rating, status, title } }: IBookInput,
			context: any
		) {
			try {
				// if (!context.user) {
				// 	console.log(context);
				// 	return new GraphQLError('not logged in');
				// }

				const newBook = new Book({
					author: author,
					lastModified: new Date().toISOString(),
					pages: pages,
					rating: rating,
					status: status,
					title: title,
				});

				// console.log(pubsub);
				await newBook.save();

				await pubsub.publish('BOOK_CREATED', { bookAdded: newBook });

				await pubsub.publish('BOOK_CREATED_FILTER', {
					bookAddedFilter: newBook,
				});
				// console.log(pubsub);

				return newBook;
			} catch (err) {
				throw new GraphQLError(`Error: ${err}`);
			}
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
	},

	Subscription: {
		bookAdded: {
			subscribe: () => pubsub.asyncIterator(['BOOK_CREATED']),
		},
		bookAddedFilter: {
			subscribe: withFilter(
				() => pubsub.asyncIterator('BOOK_CREATED_FILTER'),
				(payload, variables) => {
					// variables - what we added as parameters in our typeDefs for subscription - user can request to listen to recieve subscriptions
					// payload - comes from mutation

					// console.log('variables', variables.title);
					return payload.bookAddedFilter.title === variables.title;
				}
			),
		},
	},
};
