const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	author: String,
	category: String,
	publisher: String,
	published: {
		type: Date,
		default: Date.now
	}
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;