import {ApolloServer} from '@apollo/server';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {typeDefs} from './graphql/typeDefs/index';
import {resolvers} from './graphql/resolvers/index';

import {makeExecutableSchema} from '@graphql-tools/schema';
import {WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';

import User from './models/User';

const Settings = require("./models/Settings");
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

const {google} = require("googleapis");


import {v4 as uuidv4} from 'uuid';
import {} from './types/global';

async function startApolloServer() {
    await mongoose
        .connect(process.env.MONGO_URI)
        // .connect("mongodb://mongo:27017/express-apollo-docker")
        .then(() => console.log('connected to DB'));
    const app = express();

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
    );

    app.use(session({
        secret: "cats", resave: false, saveUninitialized: true,
    }));

    app.use(passport.initialize());
    app.use(passport.session());


    function isLoggedIn(req, res, next) {
        req.user ? next() : res.sendStatus(401);
    }

    app.get('/login', (req: any, res: any) => {
        // res.send('test');
        // console.log(req.session);
        res.send('<div>' +
            '<a href="/auth/google">Login with Google</a>' +
            // '<a href="/protected">protected route</a></div>');
            '<a href="/graphql">protected route</a></div>');
    });

    app.get("/auth/google",
        passport.authenticate("google", {
            scope: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
            accessType: "offline"
        })
    );

    app.get("/google/callback", passport.authenticate("google", {
        // successRedirect: "/protected",
        successRedirect: "/graphql",
        failureRedirect: "/auth/failure",
        // accessType: "offline"
    }));


    app.get("/calendar", isLoggedIn, async (req: any, res: any) => {
        // const user = await User.findOne({id: req.session.passport.user})
        const user = await Settings.findOne({googleId: req.session.passport.user.id});
        const refreshToken = user!.refreshToken;

        oauth2Client.setCredentials({refresh_token: refreshToken});
        const calendar = google.calendar({version: "v3", auth: oauth2Client});

        console.log(calendar);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        console.log(response);

        // console.log(req.session.passport.user);

        // oauth2Client.credentials = {
        //     access_token: "ya29.a0Aa4xrXMoma7qHkuXVy92nXt6D9R_4THY9RXVzrYtFFcuujxWrcBx8mgrWr9p57Gn8Kso80n5Xta6IU3zUxiw9rT0yyxplq_aiBMXVLYPYPysFI8UBoaGS9oslkJmOq5lsgww_8yvC0_-0ncAFjKYC8BeObm7aCgYKATASARASFQEjDvL9LlUIeHB8xOn5XqZAfOkbAA0163",
        //     refresh_token: "1//04luggPD-xXnQCgYIARAAGAQSNwF-L9IraD0-_qtIoi4hVIH5bqS1b-YKSletXO4SZV1e9gc0TDhAYU7-Oaxd18Y71PBzWYwRZx4"
        // };
        //
        //
        // const calendar = google.calendar({version: 'v3', auth: oauth2Client});
        //
        //
        // const response = await calendar.events.list({
        //     calendarId: 'primary',
        //     timeMin: new Date().toISOString(),
        //     maxResults: 10,
        //     singleEvents: true,
        //     orderBy: 'startTime',
        // });
        //
        // console.log(response);

        // Error: No access, refresh token, API key or refresh handler callback is set.

        // const events = response.data.items;
        // console.log(events);


    });


    // app.get("/calendar", isLoggedIn, async (req: any, res: any) => {
    //     oauth2Client.credentials = {
    //         // access_token: req.user.access_token,
    //         // refresh_token: req.user.refresh_token
    //         access_token: "ya29.a0Aa4xrXMoma7qHkuXVy92nXt6D9R_4THY9RXVzrYtFFcuujxWrcBx8mgrWr9p57Gn8Kso80n5Xta6IU3zUxiw9rT0yyxplq_aiBMXVLYPYPysFI8UBoaGS9oslkJmOq5lsgww_8yvC0_-0ncAFjKYC8BeObm7aCgYKATASARASFQEjDvL9LlUIeHB8xOn5XqZAfOkbAA0163",
    //         refresh_token: "1//04luggPD-xXnQCgYIARAAGAQSNwF-L9IraD0-_qtIoi4hVIH5bqS1b-YKSletXO4SZV1e9gc0TDhAYU7-Oaxd18Y71PBzWYwRZx4"
    //     };
    //
    //     // let calendar = google.calendar({version: 'v3', auth: oauth2Client});
    //     // console.log(calendar.events);
    //
    //     const calendar = google.calendar({version: 'v3', auth: oauth2Client});
    //
    //     // console.log(calendar.events.context);
    //
    //     const response = await calendar.events.list({
    //         // auth: oauth2Client,
    //         calendarId: 'primary',
    //         timeMin: new Date().toISOString(),
    //         maxResults: 10,
    //         singleEvents: true,
    //         orderBy: 'startTime',
    //     });
    //
    //     console.log(response);
    //
    //     // Error: No access, refresh token, API key or refresh handler callback is set.
    //
    //     const events = response.data.items;
    //     console.log(events);
    //
    //     // let calendar = google.calendar('v3');
    //     // calendar.events.list({
    //     //     // auth: oauth2Client,
    //     //     calendarId: 'primary',
    //     //     timeMin: (new Date()).toISOString(),
    //     //     maxResults: 10,
    //     //     singleEvents: true,
    //     //     orderBy: 'startTime'
    //     // }, function (err, response) {
    //     //     // process result
    //     //     console.log(response);
    //     // });
    // });

    app.get("/auth/failure", (req, res) => {
        res.send("something went wrong");
    });

    // app.get("/protected", isLoggedIn, (req: any, res: any) => {
    //     res.send(`hello ${req.user.displayName} <img src=${req.user.picture}> <a href="/logout">logout</a>`);
    // });

    app.get("/graphql", isLoggedIn, (req: any, res: any, next: any) => {
        // console.log(req.user);
        // res.send(`hello ${req.user.displayName} <img src=${req.user.picture}> <a href="/logout">logout</a>`);

        // res.send("protected route");
        next();
    });

    app.get("/logout", (req: any, res: any, next: any) => {
        // req.logout(req.user, err => {
        //     if (err) return next(err);
        //     res.redirect("/login");
        // });

        // console.log("SESSION BEFORE DESTROY", req.session);


        req.session.destroy();

        // console.log("SESSION AFTER DESTROY", req.session);
        res.redirect("/login");
        // res.send("goodbye");
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