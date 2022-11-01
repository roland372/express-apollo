import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import LoginGoogle from './components/LoginGoogle';
import axios from 'axios';
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
	from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import GetBooks from './components/GetBooks';
import CreateBook from './components/CreateBook';

const errorLink: any = onError(({ graphqlErrors, networkError }: any) => {
	if (graphqlErrors) {
		graphqlErrors.map(({ message, location, path }: any) => {
			console.log(`graphql error ${message}`);
		});
	}
});

const link = from([
	errorLink,
	new HttpLink({ uri: 'http://localhost:5000/graphql' }),
]);

// create graphql client
const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: link, // link to our backend
});

function App() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const getUser = async () => {
			await fetch('http://localhost:5000/login/success', {
				method: 'GET',
				credentials: 'include',
				// @ts-ignore
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'Access-Control-Allow-Credentials': true,
				},
			})
				.then(response => {
					if (response.status === 200) return response.json();
					throw new Error('authentication failed');
				})
				.then(resObject => {
					setUser(resObject.user);
				})
				.catch(err => {
					console.log(err);
				});
		};
		getUser();
	}, []);

	console.log(user);
	return (
		<ApolloProvider client={client}>
			<div className='App'>
				{/*<Login/>*/}
				<LoginGoogle />
				<CreateBook />
				<GetBooks />
			</div>
		</ApolloProvider>
	);
}

export default App;
