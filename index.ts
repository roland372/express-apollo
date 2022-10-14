const { ApolloServer } = require('apollo-server');
import { Response } from 'express';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
import {} from './types/global';

// apollo server requires 2 things to run:
// typeDefs - graphql type definitions
// resolvers: how do we resolve our queries or mutations

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

// declare module 'express' {
// 	export interface Response {
// 		url: string;
// 	}
// }

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log('mongodb connected');
		return server.listen({ port: 5000 });
	})
	.then((res: Response) => {
		console.log(`server running at ${res.url}`);
	});
