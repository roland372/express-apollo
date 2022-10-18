import Book from '../../models/Book.js';
import { GraphQLError } from 'graphql';
export const booksResolvers = {
    Query: {
        async getAllBooks() {
            return Book.find();
        }
    },
    Mutation: {
        async addBook(parent, args, context) {
            try {
                if (!context.user) {
                    console.log(context);
                    return new GraphQLError('You must log in!');
                }
                const { bookAuthor, bookTitle, bookDesc } = args;
                const newBook = new Book({ bookAuthor, bookTitle, bookDesc });
                await newBook.save();
                console.log(context);
                return newBook;
            }
            catch (err) {
                throw new GraphQLError(`Error: ${err}`);
            }
        },
    }
};
