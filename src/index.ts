import {ApolloServer} from '@apollo/server';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {typeDefs} from './graphql/typeDefs/index';
import {resolvers} from './graphql/resolvers/index';

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

async function startApolloServer() {
    await mongoose
        .connect(process.env.MONGO_URI)
        // .connect("mongodb://mongo:27017/express-apollo-docker")
        .then(() => console.log('connected to DB'));
    const app = express();


    app.use(session({
        secret: "cats", resave: false, saveUninitialized: true,
    }));

    app.use(passport.initialize());
    app.use(passport.session());


    function isLoggedIn(req, res, next) {
        req.user ? next() : res.sendStatus(401);
    }

    app.get('/login', (req, res) => {
        // res.send('test');
        res.send('<div>' +
            '<a href="/auth/google">Login with Google</a>' +
            '<a href="/protected">protected route</a></div>');
    });

    app.get("/auth/google",
        passport.authenticate("google", {
            scope: ["email", "profile"] // what info we want to get from user
        })
    );

    app.get("/google/callback", passport.authenticate("google", {
        successRedirect: "/protected",
        failureRedirect: "/auth/failure"
    }));

    app.get("/auth/failure", (req, res) => {
        res.send("something went wrong");
    });

    app.get("/protected", isLoggedIn, (req: any, res: any) => {
        // console.log(req.user);
        res.send(`hello ${req.user.displayName} <img src=${req.user.picture}> <a href="/logout">logout</a>`);

        // res.send("protected route");
    });

    app.get("/logout", (req: any, res: any, next: any) => {
        // req.logout(req.user, err => {
        //     if (err) return next(err);
        //     res.redirect("/login");
        // });
        req.session.destroy();
        res.send("goodbye");
    });

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
            context: async ({req}: any) => ({
                session: req.session,
                user: await User.findOne({username: req.session.username}),
                path: '/',
            }),
        })
    );

    await new Promise<void>(resolve =>
        httpServer.listen({port: 5000}, resolve)
    );
}

startApolloServer().then(() => console.log('server running at port 5000'));
// MONGO_URI="mongodb://mongo:27017"