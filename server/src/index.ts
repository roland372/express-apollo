import {ApolloServer} from '@apollo/server';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {typeDefs} from './graphql/typeDefs';
import {resolvers} from './graphql/resolvers';

import {makeExecutableSchema} from '@graphql-tools/schema';
import {WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';

import User from './models/User';

import mongoose from 'mongoose';

import {expressMiddleware} from '@apollo/server/express4';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';

import http from 'http';
import cors from 'cors';
import 'dotenv/config';

const passport = require("passport");
require("./auth");

import {v4 as uuidv4} from 'uuid';
import {} from './types/global';

import authRoute from './routes/auth';

async function startApolloServer() {
    await mongoose
        .connect(process.env.MONGO_URI)
        // .connect("mongodb://mongo:27017/express-apollo-docker")
        .then(() => console.log('connected to DB'));
    const app = express();

    app.use(session({
        name: 'mySession',
        secret: uuidv4(),
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        },
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(cors({
        origin: "http://localhost:3000",
        methods: "GET, POST, PUT, DELETE",
        credentials: true
    }));

    app.use("/", authRoute);

    const schema = makeExecutableSchema({typeDefs, resolvers});

    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({schema}, wsServer);

    const server = new ApolloServer({
        schema: schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start();
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(
            {credentials: true}
        ),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async ({req}: any) => ({
                session: req.session,
                user: await User.findOne({username: req.session.username}),
            }),
        })
    );

    await new Promise<void>(resolve =>
        httpServer.listen({port: 5000}, resolve)
    );
}

startApolloServer().then(() => console.log('server running at port 5000'));
