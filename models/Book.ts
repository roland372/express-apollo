const { model, Schema } = require('mongoose');

const bookSchema = new Schema({
	author: String,
	lastModified: String,
	pages: Number,
	rating: Number,
	status: String,
	title: String,
});

module.exports = model('Book', bookSchema);
