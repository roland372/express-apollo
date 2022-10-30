import express, {Request, Response, NextFunction} from "express";
import {google} from "googleapis";

const Settings = require("../models/Settings");
const passport = require("passport");
require("../auth");

import isLoggedIn from "../helpers/isLoggedIn";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

router.get("/login/success", (req: Request, res: Response) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "SUCCESS",
            user: req.user,
            cookies: req.cookies
        });
    }
});

router.get("/login/failed", (req: Request, res: Response) => {
    res.status(401).json({
        success: false,
        message: "FAILURE"
    });
});

router.get("/logout", (req: any, res: Response) => {
    // req.logout();
    req.session.destroy();
    res.redirect("http://localhost:3000");
});

router.get("/google", passport.authenticate("google", {
        scope: ["profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
        accessType: 'offline',
        prompt: 'consent'
    },
));

router.get("/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:3000",
    // successRedirect: "http://localhost:5000/calendar",
    failureRedirect: "/login/failed",
    accessType: 'offline',
    prompt: 'consent'
}));

// router.get("/google/callback", passport.authenticate("google", {
//     scope: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
//     successRedirect: "/graphql",
//     failureRedirect: "/auth/failure",
//     accessType: 'offline',
//     // prompt: 'consent'
// }));

router.get('/login', (req: Request, res: Response) => {
    res.send('<div>' +
        '<a href="/auth/google">Login with Google</a>' +
        '<a href="/graphql">protected route</a></div>');
});

router.get("/auth/google",
    passport.authenticate("google", {
        scope: ["email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
        accessType: 'offline',
        prompt: 'consent'
    })
);

router.get("/calendar", isLoggedIn, async (req: any, res: any) => {
    // const user = await User.findOne({id: req.session.passport.user})

    const user = await Settings.findOne({googleId: req.session.passport.user.id});

    const refreshToken = user!.refreshToken;

    console.log("<----- USER ----->", user);
    console.log("<----- TOKEN ----->", refreshToken);

    oauth2Client.setCredentials({refresh_token: refreshToken});
    const calendar = google.calendar({version: "v3", auth: oauth2Client});

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 2,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = response.data.items;
    res.send(events);
});

router.get("/create", isLoggedIn, async (req: any, res: any) => {
    const user = await Settings.findOne({googleId: req.session.passport.user.id});

    const refreshToken = user!.refreshToken;

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

    const calendar: any = google.calendar({version: 'v3', auth: oauth2Client});
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

router.get("/auth/failure", (req: Request, res: Response) => {
    res.send("something went wrong");
});

router.get("/protected", isLoggedIn, (req: any, res: Response) => {
    res.send(`hello ${req.user.displayName} <img src=${req.user.picture} alt="profile"> <a href="/logout">logout</a>`);
});

router.get("/graphql", isLoggedIn, (req: any, res: Response, next: NextFunction) => {
    // console.log(req.user.id);
    req.session.googleId = req.user.id;
    console.log(req.session);

    // res.send(`hello ${req.user.displayName} <img src=${req.user.picture}> <a href="/logout">logout</a>`);
    // res.send("protected route");
    next();
});

export default router;