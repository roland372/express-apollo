import Book from '../../models/Book';
import { GraphQLError } from 'graphql';

import { IBook, IBookArgs, IBookInput } from '../../types/book';
import { TQuery } from '../../types/query';
import { TPagination } from '../../types/pagination';

import { PubSub, withFilter } from 'graphql-subscriptions';
import { send } from '../../../kafka/producer';

const pubsub = new PubSub();

export const booksResolvers = {
	Query: {
		async getSingleBook<T>(parent: T, { ID }) {
			// search book in our database with mongoose
			return await Book.findById(ID);
		},

		async getAllBooks<T>(parent: T, { amount }: IBookArgs, context: any) {
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

		async filterBooks<T>(
			parent: T,
			{ filterInput: { author, pagesMin, status, title }, sort, limit, page }
		) {
			const totalBooks = await Book.countDocuments();
			const currentPage = page || 1;
			const booksPerPage = limit || totalBooks;

			const query: Record<string, Record<string, string>> = {};

			if (author) query.author = { $regex: author || '', $options: 'i' };
			if (status) query.status = { $regex: status || '', $options: 'i' };
			if (title) query.title = { $regex: title || '', $options: 'i' };
			if (pagesMin) query.pages = { $gte: pagesMin };

			let sortOpt = sort;
			sortOpt === 'asc' ? (sortOpt = 1) : (sortOpt = -1);

			const books = await Book.find(query)
				.sort({
					lastModified: sortOpt,
				})
				.skip((currentPage - 1) * booksPerPage)
				.limit(booksPerPage);

			return { totalItems: totalBooks, books };
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
			// console.log('CONTEXT', context.session);
			try {
				if (!context?.session?.passport?.user) {
					// console.log(context);
					return new GraphQLError('not logged in');
				}

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

				await send('books', newBook);

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
