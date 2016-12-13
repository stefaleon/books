const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
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