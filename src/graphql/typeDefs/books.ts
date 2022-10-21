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

enum Status {
	reading
	completed
	on_hold
	dropped
	plan_to_read
}

# allow user to create book
input BookInput {
	author: String!
	pages: Int
	rating: Int
	status: Status
	title: String!
	}

# only allow editing specific fields
input EditBookInput {
	author: String
	title: String
}

input FilterInput {
	author: String
	pagesMin: Int
	status: Status
	title: String
}

type Pagination {
		totalItems: Int
    books: [Book]
}

type Query {
	getBooks(bookInput: BookInput, limit: Int, offset:Int): [Book]
}


type Query {
    getSingleBook(ID: ID!): Book!
    getAllBooks(amount: Int): [Book]
    getSomeBooks(limit: Int, page: Int): Pagination
    # filterBooks(filterInput: FilterInput, sort: String): [Book]
    filterBooks(filterInput: FilterInput, sort: String, limit: Int, page: Int): Pagination
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
	# bookAdded(bookInput: BookInput): Book
	bookAdded: Book!
	bookAddedFilter(title: String!): Book!
}
`;
