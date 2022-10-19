export const typeBooks = `#graphql
type Book {
  author: String
	lastModified: String
	_id: String
	pages: Int
	rating: Int
	status: String
	title: String
}

# allow user to create book
input BookInput {
	author: String!
	pages: Int
	rating: Int
	status: String
	title: String!
	}

# only allow editing specific fields
input EditBookInput {
	author: String
	title: String
}

type Pagination {
		totalItems: Int
    books: [Book]
}

type Query {
    getSingleBook(ID: ID!): Book!
    getAllBooks(amount: Int): [Book]
    getSomeBooks(limit: Int, page: Int): Pagination
}
type Mutation {
  createBook(bookInput: BookInput): Book!
	# deleteBook(ID: ID!): Book
	deleteBook(ID: ID!): Boolean
	# editBook(ID: ID!, editBookInput: editBookInput): Boolean
	editBook(ID: ID!, bookInput: EditBookInput): Boolean
}

type Subscription {
	# trigger an event whenever we create new book
	bookCreated(bookInput: BookInput): Book!
}
`;
