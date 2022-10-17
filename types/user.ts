import { Document } from 'mongoose';

export interface IUser extends Document {
	email: string;
	_id: string;
	ID: string;
	password: string;
	token: string;
	username: string;
}

export interface IUserInput extends IUser {
	registerInput: IUser;
}
