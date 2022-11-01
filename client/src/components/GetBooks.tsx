import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { GET_ALL_BOOKS } from '../GraphQL/Queries';

const GetBooks = () => {
	const { error, loading, data } = useQuery(GET_ALL_BOOKS);

	const [books, setBooks] = useState([]);

	useEffect(() => {
		// console.log(data);
		if (data) {
			setBooks(data.getAllBooks);
		}
	}, [data]);

	console.log(books);

	return (
		<div>
			{books.map((book: any, index) => {
				return (
					<div style={{ border: '1px solid red' }} key={index}>
						<div>title: {book.title}</div>
						<div>author: {book.author}</div>
						<div>rating: {book.rating}</div>
					</div>
				);
			})}
		</div>
	);
};

export default GetBooks;
