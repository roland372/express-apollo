export const typeUsers = `#graphql
type User {
    userName: String
    email: String
    password: String
    role: String
}
type Query {
    getUser(id: ID!): User
}
type Mutation {
    registerUser(userName: String, email: String, password: String): User!
    loginUser(email: String, password: String): User!
    editUser(id: ID, userName: String): User
    logout: Boolean
}
`;
