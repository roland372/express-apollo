const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GoogleUser = require("./models/GoogleUser");
const Settings = require("./models/Settings");


passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/google/callback",
        passReqToCallback: true,
        accessType: 'offline', prompt: 'consent'
    },
    function (request, accessToken, refreshToken, profile, done) {
        // console.log(profile.displayName);
        // console.log("request query", request.query.code);

        // const calendar = google.calendar({version: "v3", auth: profile});

        // console.log(request.query.code);
        // console.log(accessToken);
        // console.log("access token", accessToken);

        // GoogleUser.findOne({googleId: profile.id}).then((currentUser) => {
        //     if (currentUser) {
        //         //    user already exists
        //         console.log("user is: ", currentUser);
        //     } else {
        //         //    save new user to db
        //         new GoogleUser({
        //             username: profile.displayName,
        //             googleId: profile.id,
        //             refreshToken: refreshToken
        //         }).save().then((newUser) => {
        //             console.log("new user: " + newUser);
        //         });
        //     }
        // });


        Settings.findOne({googleId: profile.id}).then((currentUser) => {
            if (currentUser) {
                //    user already exists
                // console.log("user is: ", currentUser);
            } else {
                //    save new user to db
                new Settings({
                    googleId: profile.id,
                    refreshToken: refreshToken
                }).save().then((newUser) => {
                    // console.log("new user: " + newUser);
                });
            }
        });


        return done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});