import { useState } from 'react';
import { CREATE_BOOK_MUTATION } from '../GraphQL/Mutations';
import { useMutation } from '@apollo/client';

const CreateBook = () => {
	const [author, setAuthor] = useState('default author');
	const [pages, setPages] = useState(200);
	const [rating, setRating] = useState(10);
	const [status, setStatus] = useState('completed');
	const [title, setTitle] = useState('default title');

	const [createBook, { error }] = useMutation(CREATE_BOOK_MUTATION);

	const addBook = () => {
		console.log(author);
		createBook({
			variables: {
				author: author,
				pages: pages,
				rating: rating,
				status: status,
				title: title,
			},
		});

		if (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<input
				type='text'
				placeholder='author'
				defaultValue={author}
				onChange={e => {
					setAuthor(e.target.value);
				}}
			/>
			<input
				type='text'
				placeholder='pages'
				defaultValue={pages}
				onChange={e => {
					setPages(parseInt(e.target.value));
				}}
			/>
			<input
				type='text'
				placeholder='rating'
				defaultValue={rating}
				onChange={e => {
					setRating(parseInt(e.target.value));
				}}
			/>
			<input
				type='text'
				placeholder='status'
				defaultValue={status}
				onChange={e => {
					setStatus(e.target.value);
				}}
			/>
			<input
				type='text'
				placeholder='title'
				defaultValue={title}
				onChange={e => {
					setTitle(e.target.value);
				}}
			/>
			<button onClick={addBook}>Create Book</button>
		</div>
	);
};

export default CreateBook;
