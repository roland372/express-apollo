import { Document } from 'mongoose';

export interface IBook {
	author: string;
	lastModified: string;
	ID: string;
	pages: number;
	rating: number;
	status: string;
	title: string;
}

export interface IBookInput extends IBook {
	bookInput: IBook;
}

export interface IBookArgs extends IBook {
	amount: number;
}

// type TBook = {
// 	author: string;
// 	lastModified: string;
// 	ID: string;
// 	pages: number;
// 	rating: number;
// 	status: string;
// 	title: string;
// 	amount: TBookArgs;
// 	bookInput: TBookInput;
// };

// type TBookInput = {
// 	author: string;
// 	pages: number;
// 	rating: number;
// 	status: string;
// 	title: string;
// };

// type TBookArgs = {
// 	amount: number;
// };
