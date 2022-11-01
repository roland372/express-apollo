import { gql } from '@apollo/client';

export const GET_ALL_BOOKS = gql`
	query GetAllBooks {
		getAllBooks {
			author
			lastModified
			_id
			pages
			rating
			status
			title
		}
	}
`;
