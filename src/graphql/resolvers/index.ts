import { booksResolvers } from './books';
import { usersResolvers } from './users';

// export const resolvers = [booksResolvers, usersResolvers];

export const resolvers = {
	Query: {
		...booksResolvers.Query,
		...usersResolvers.Query,
	},
	Mutation: {
		...booksResolvers.Mutation,
		...usersResolvers.Mutation,
	},
};
