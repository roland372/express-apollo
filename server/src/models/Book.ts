import mongoose, { Schema } from 'mongoose';
import { IBook } from '../types/book';

const BookSchema: Schema<IBook> = new Schema({
	author: String,
	lastModified: String,
	pages: Number,
	rating: Number,
	status: String,
	title: String,
});

export default mongoose.model('Book', BookSchema);
