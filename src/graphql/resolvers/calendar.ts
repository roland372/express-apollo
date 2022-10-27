// import User from "../models/User";
const Settings = require("../../models/Settings");
import {google} from "googleapis";


export const calendarResolvers = {
    Calendar: {
        organizer: (calendar) => calendar.organizer.email,
        start: (calendar) => calendar.start.dateTime,
        end: (calendar) => calendar.end.dateTime,
    },

    Query: {
        async getCalendarEvents<T>(parent: T, args: any, req: any) {
            const token = await Settings.find();

            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URL
            );

            // console.log(req.session.passport.user.id);
            // console.log(context.req);
            // console.log(context.session.passport);
            // console.log(context);

            // const user = await Settings.findOne({googleId: req.session.passport.user.id});
            const refreshToken = token[0].refreshToken;

            console.log(refreshToken);

            oauth2Client.setCredentials({refresh_token: refreshToken});
            const calendar = google.calendar({version: "v3", auth: oauth2Client});

            const response = await calendar.events.list({
                calendarId: "primary",
                timeMin: new Date().toISOString(),
                maxResults: 2,
                singleEvents: true,
                orderBy: "startTime",
            });

            const events = response.data.items;
            console.log(events);

            return events;
        },
    },

    Mutation: {
        async addCalendarEvent<T>(parent: T, args: any) {
            console.log(args);
            const {summary, organizer, start, end, status, hangoutLink} = args;
            const token = await Settings.find();
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URL
            );
            oauth2Client.credentials = {
                refresh_token: token[0].refreshToken
            };
            const event: any = {
                'summary': summary,
                'organizer': {
                    'email': organizer
                },
                'start': {
                    'dateTime': start,
                    'timeZone': 'Europe/Warsaw',
                },
                'end': {
                    'dateTime': end,
                    'timeZone': 'Europe/Warsaw',
                },
                'status': status,
                'hangoutLink': hangoutLink
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
            return event;
        }
    }
};


// {
//     "summary": "This is the summary",
//     "organizer": "This is the organizer",
//     "start": "2022-10-28T13:00:00-07:00",
//     "end": "2022-10-28T14:00:00-07:00",
//     "status": "confirmed",
//     "hangoutLink": "example.link.com"
// }