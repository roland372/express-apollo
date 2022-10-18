import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs } from './graphql/typeDefs/index';
import { resolvers } from './graphql/resolvers/index';

import User from './models/User';
import mongoose from 'mongoose';

import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';

import http from 'http';
import cors from 'cors';
import 'dotenv/config';

import { v4 as uuidv4 } from 'uuid';
import {} from './types/global';

async function startApolloServer() {
	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => console.log('connected to DB'));
	const app = express();

	const httpServer = http.createServer(app);
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});
	await server.start();
	app.use(
		'/',
		cors<cors.CorsRequest>(),
		bodyParser.json(),
		session({
			name: 'mySession',
			secret: uuidv4(),
			resave: false,
			saveUninitialized: true,
			cookie: {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24,
			},
		}),
		expressMiddleware(server, {
			context: async ({ req }: any) => ({
				session: req.session,
				user: await User.findOne({ username: req.session.username }),
				path: '/graphql',
			}),
		})
	);

	await new Promise<void>(resolve =>
		httpServer.listen({ port: 5000 }, resolve)
	);
}

startApolloServer().then(() => console.log('server running at port 5000'));
