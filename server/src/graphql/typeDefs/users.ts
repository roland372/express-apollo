export const typeUsers = `#graphql
type User {
    username: String
    email: String
    password: String
    role: String
}

# what information user is going to enter
input RegisterInput {
	username: String
	email: String
	password: String
}

input LoginInput {
	email: String
	password: String
}

type Query {
    getUser(id: ID!): User
}
type Mutation {
    registerUser(registerInput: RegisterInput): User!
	loginUser(loginInput: LoginInput): User!
    logoutUser: Boolean
}
`;
