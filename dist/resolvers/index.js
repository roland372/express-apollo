import { booksResolvers } from './books/books.js';
import { usersResolvers } from './users/users.js';
export const resolvers = [booksResolvers, usersResolvers];
