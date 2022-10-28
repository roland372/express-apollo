export const typeCalendar = `#graphql
type Calendar {
    summary: String
    organizer: String
    start: String
    end: String
    status: String
    hangoutLink: String
}

type Query {
    getCalendarEvents: [Calendar]
}

type Mutation {
    # addCalendarEvent(summary: String, organizer: String, start: String, end: String, status: String, hangoutLink: String): Calendar
    addCalendarEvent(summary: String, organizer: String, start: String, end: String, status: String): Calendar

}
`;