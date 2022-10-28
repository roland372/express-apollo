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
