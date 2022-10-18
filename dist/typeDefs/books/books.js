export const typeBooks = `#graphql
type Book {
    bookAuthor: String
    bookTitle: String
    bookDesc: String
}
type Query {
    getAllBooks: [Book]
}
type Mutation {
    addBook(bookAuthor: String, bookTitle: String, bookDesc: String): Book
}
`;
