import mongoose, { Schema } from 'mongoose';
import { TBook } from '../types/types';

const BookSchema: Schema<TBook> = new Schema({
	author: String,
	lastModified: String,
	pages: Number,
	rating: Number,
	status: String,
	title: String,
});

export default mongoose.model('Book', BookSchema);
