import {booksResolvers} from './books';
import {usersResolvers} from './users';
import {calendarResolvers} from './calendar';

// export const resolvers = [booksResolvers, usersResolvers, calendarResolvers];

export const resolvers = {
    Query: {
        ...booksResolvers.Query,
        ...usersResolvers.Query,
        ...calendarResolvers.Query,
    },
    Mutation: {
        ...booksResolvers.Mutation,
        ...usersResolvers.Mutation,
        ...calendarResolvers.Mutation,
    },
    Subscription: {
        ...booksResolvers.Subscription,
    },
    Calendar: {
        ...calendarResolvers.Calendar,
    }
};
