// // const { ApolloServer } = require('apollo-server-express');
// const { ApolloServer } = require('apollo-server');
// import express, { Response } from 'express';
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();
// import {} from './types/global';

// const session = require('express-session');
// import { v4 as uuidv4 } from 'uuid';

// // apollo server requires 2 things to run:
// // typeDefs - graphql type definitions
// // resolvers: how do we resolve our queries or mutations

// const app = express();
// app.use(
// 	session({
// 		secret: uuidv4(),
// 		resave: false,
// 		saveUninitialized: true,
// 	})
// );

// const typeDefs = require('./graphql/typeDefs');
// const resolvers = require('./graphql/resolvers/index');

// const server = new ApolloServer({
// 	typeDefs,
// 	resolvers,
// });

// // server.applyMiddleware({
// // 	app,
// // 	path: '/graphql',
// // });

// mongoose
// 	.connect(process.env.MONGO_URI)
// 	.then(() => {
// 		console.log('mongodb connected');
// 		return server.listen({ port: 5000 });
// 	})
// 	.then((res: Response) => {
// 		console.log(`server running at ${res.url}`);
// 	});

const { ApolloServer } = require('apollo-server-express');
// const { ApolloServer } = require('apollo-server');
import express from 'express';
const mongoose = require('mongoose');
import cors from 'cors';
const dotenv = require('dotenv');
dotenv.config();
import {} from './types/global';

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

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }: any) => ({
			req,
			res,
			session: req.session,
		}),
	});
	await server.start();

	server.applyMiddleware({ app, path: '/graphql' });

	app.use(
		session({
			name: 'token',
			secret: uuidv4(),
			resave: false,
			saveUninitialized: true,
			cookie: {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24 * 7,
			},
		})
	);

	app.use((req, res) => {
		res.status(200);
		res.send('Hello!');
		res.end();
	});

	app.listen({ port: 5000 }, () => console.log('server running'));
}

startApolloServer();

// mongoose
// 	.connect(process.env.MONGO_URI)
// 	.then(() => {
// 		console.log('DB connected');
// 		startServer();
// 	})
// 	.catch((error: any) => {
// 		console.error(error);
// 		process.exit(1);
// 	});

// const startServer = async () => {
// 	app.use(cors());

// 	app.use(express.json());

// 	const server = new ApolloServer({
// 		typeDefs,
// 		resolvers,
// 	});

// 	await server.start();
// 	server.applyMiddleware({ app, path: '/graphql' });

// 	app.listen({ port: 5000 }, () => console.log('server running'));
// };
