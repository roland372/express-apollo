const { gql } = require('apollo-server');

module.exports = gql`
	# describe our type
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

	# read information
	type Query {
		# ! means it must exist and is required
		book(ID: ID!): Book!
		# return array of books
		getBooks(amount: Int): [Book]
	}

	# modify data
	type Mutation {
		# : return
		createBook(bookInput: BookInput): Book!
		# deleteBook(ID: ID!): Book
		deleteBook(ID: ID!): Boolean
		# editBook(ID: ID!, editBookInput: editBookInput): Boolean
		editBook(ID: ID!, bookInput: EditBookInput): Boolean
	}
`;
