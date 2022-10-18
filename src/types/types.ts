export type TBook = {
	author: string;
	lastModified: string;
	ID: string;
	pages: number;
	rating: number;
	status: string;
	title: string;
};

export type TUser = {
	username: string;
	email: string;
	password: string;
	role: string;
};

export type TGetUser = {
	id: string;
};

export type TEditUser = {
	id: string;
	username: string;
};
