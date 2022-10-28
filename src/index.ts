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

    // app.use(session({
    //     secret: "cats", resave: false, saveUninitialized: true,
    // }));

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
            accessType: 'offline',
            prompt: 'consent'
        })
    );

    app.get("/google/callback", passport.authenticate("google", {
        scope: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
        successRedirect: "/graphql",
        failureRedirect: "/auth/failure",
        accessType: 'offline',
        // prompt: 'consent'
    }));


    app.get("/calendar", isLoggedIn, async (req: any, res: any) => {
        // const user = await User.findOne({id: req.session.passport.user})

        const user = await Settings.findOne({googleId: req.session.passport.user.id});

        const refreshToken = user!.refreshToken;

        // console.log("user", user);
        // console.log("token", refreshToken);

        oauth2Client.setCredentials({refresh_token: refreshToken});
        const calendar = google.calendar({version: "v3", auth: oauth2Client});

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 2,
            singleEvents: true,
            orderBy: 'startTime',
        });

        // console.log(response);

        const events = response.data.items;
        // console.log("EVENTS", events);
        // console.log("ATTENDEES", events[0].attendees);

        res.send(events);
    });

    app.get("/create", isLoggedIn, async (req: any, res: any) => {
        const user = await Settings.findOne({googleId: req.session.passport.user.id});

        const refreshToken = user!.refreshToken;

        // console.log("user", user);
        // console.log("token", refreshToken);

        oauth2Client.setCredentials({refresh_token: refreshToken});


        const event = {
            'summary': 'test event',
            'location': '800 Howard St., San Francisco, CA 94103',
            'description': 'test',
            'start': {
                'dateTime': '2022-10-28T09:00:00-07:00',
                // 'timeZone': 'Asia/Kolkata',
                'timeZone': 'Poland',
            },
            'end': {
                'dateTime': '2022-10-28T17:00:00-07:00',
                'timeZone': 'Poland',
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        };

        const calendar = google.calendar({version: 'v3', auth: oauth2Client});
        calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            resource: event,
            visibility: "public"
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event created: %s', event.data.htmlLink);

        });

        res.send(event);
    });


    app.get("/auth/failure", (req, res) => {
        res.send("something went wrong");
    });

    // app.get("/protected", isLoggedIn, (req: any, res: any) => {
    //     res.send(`hello ${req.user.displayName} <img src=${req.user.picture}> <a href="/logout">logout</a>`);
    // });

    app.get("/graphql", isLoggedIn, (req: any, res: any, next: any) => {
        // console.log(req.user.id);
        req.session.googleId = req.user.id;
        console.log(req.session);

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
        // playground: {
        //     settings: {
        //         'request.credentials': 'include',
        //     },
        // },


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
        // session({
        //     name: 'mySession',
        //     secret: uuidv4(),
        //     resave: false,
        //     saveUninitialized: true,
        //     cookie: {
        //         httpOnly: true,
        //         maxAge: 1000 * 60 * 60 * 24,
        //     },
        // }),
        expressMiddleware(server, {
            context: async ({req}: any) => ({
                session: req.session,
                user: await User.findOne({username: req.session.username}),
                // settings: req.session.googleId
                // settings: await Settings.findOne({googleId: req.session.passport.user.id})
                // path: '/',
            }),
        })
    );

    await new Promise<void>(resolve =>
        httpServer.listen({port: 5000}, resolve)
    );
}

startApolloServer().then(() => console.log('server running at port 5000'));
// MONGO_URI="mongodb://mongo:27017"