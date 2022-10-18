const { ApolloServer } = require('apollo-server-express');
// const { ApolloServer } = require('apollo-server');
import express from 'express';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
import {} from './types/global';
const User = require('./models/User');

import { GraphQLError } from 'graphql';

const session = require('express-session');
import { v4 as uuidv4 } from 'uuid';

// apollo server requires 2 things to run:
// typeDefs - graphql type definitions
// resolvers: how do we resolve our queries or mutations

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers/index');

const db = mongoose.connection;
mongoose.connect(process.env.MONGO_URI);
db.on('error', (err: any) => console.log(err));
db.on('open', () => console.log('connected to DB'));

async function startApolloServer() {
	const app = express();

	app.use(
		session({
			name: 'mySession',
			secret: uuidv4(),
			resave: false,
			saveUninitialized: true,
			cookie: {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24 * 7,
			},
		})
	);

	const corsOptions = {
		origin: 'https://studio.apollographql.com',
		credentials: true,
	};

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: async ({ req, res }: any) => ({
			req,
			res,
			session: req.session,
		}),
	});
	await server.start();

	server.applyMiddleware({
		app,
		cors: corsOptions,
		path: '/graphql',
	});

	app.use((req, res) => {
		res.status(200);
		res.send('Hello!');
		res.end();
	});

	app.listen({ port: 5000 }, () => console.log('server running'));
}

startApolloServer();
