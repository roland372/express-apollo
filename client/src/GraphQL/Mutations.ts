import { gql } from '@apollo/client';

export const CREATE_BOOK_MUTATION = gql`
	mutation createBook(
		$author: String!
		$pages: Number!
		$rating: Number!
		$status: String!
		$title: String!
	) {
		createBook(
			author: $author
			pages: $pages
			rating: $rating
			status: $status
			title: $title
		) {
			author
		}
	}
`;
