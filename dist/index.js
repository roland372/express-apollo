import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './typeDefs/index.js';
import { resolvers } from './resolvers/index.js';
import mongoose from 'mongoose';
import User from './models/User.js';
async function startApolloServer() {
    mongoose.connect(process.env.DB_URI) //<-- connect database
        .then(() => console.log('Connected to the database!'));
    const app = express(); //<--- run express server
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })], //<-- add plugins for httpServer
    });
    await server.start(); //<-- start server
    app.use(//<-- set middleware
    '/', cors(), bodyParser.json(), session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    }), expressMiddleware(server, {
        context: async ({ req }) => ({
            session: req.session,
            user: await User.findOne({ userName: req.session.userName })
        }),
    }));
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
}
startApolloServer().then(() => console.log(`Server ready at http://localhost:4000/`));
