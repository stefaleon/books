const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
const Book = require('./models/book');
const dbURL = process.env.dbURL || 'mongodb://localhost/books';
const methodOverride = require('method-override');

mongoose.connect(dbURL);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// ROUTES
//=============================================================

// main route
app.get('/', (req, res) => {
	 res.redirect('books');
});

// new book form
app.get('/newbook', (req, res) => {
	 res.render('new');
});

// edit book form
app.get('/books/:id/edit', (req, res) => {	
	Book.findById(req.params.id,(err, foundBook) => {
		res.render('edit', { book: foundBook });			
	}); 	
});

// CREATE
//=============================================================
// create a book
app.post('/books', (req, res) => {
	console.log(req.body);
	var newBook = {
		title: req.body.title,
		author: req.body.author,
		category: req.body.category,
		publisher: req.body.publisher
	};
	Book.create(newBook, (err, newlyCreated) => {
		if (err) { 			
			console.log(err);
		} else {
			console.log('Book Created Succesfully!');
			res.redirect('/books');
		}
	});
});


// READ
//=============================================================

// show all books
app.get('/books', (req, res) => {
	Book.find({}, (err, allBooks) => {
		if (err) { 
			console.log(err);
		} else {	
			//res.json(allBooks);
			res.render('books', { books: allBooks });
		}
	});		
});

// show one book
app.get('/books/:id', (req, res) => {
	var deleteBook = false;		
	Book.findById(req.params.id, (err, aBook) => {
		if (err) {			
			console.log(err);
		} else {
			if (req.query.deletePushed === 'deleteBook') {
				deleteBook = true;	
			} else {
				deleteBook = false;	
			}			
			res.render('show', { book: aBook, deleteBook: deleteBook });
		}
	});	
});


// UPDATE
//=============================================================
// update a book
app.put('/books/:id', (req, res) => {	
	console.log(req.body);
	var updatedBook = {
		title: req.body.title,
		author: req.body.author,
		category: req.body.category,
		publisher: req.body.publisher
	};
	Book.findByIdAndUpdate(req.params.id, updatedBook, function(err, updatedBook) {
		if (err) {		
			console.log(err);	
			res.redirect('/books');
		} else {	
			console.log('Update Successful!');		
			res.redirect('/books/' + req.params.id);
		}
	});
});


// DESTROY
//=============================================================
// delete a book
app.delete('/books/:id', (req, res) => {	
	Book.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			console.log(err);
			res.redirect('/books/' + req.params.id);
		} else {	
			console.log('Remove Successful!');			
			res.redirect('/books');
		}
	}); 
});




app.listen(PORT, process.env.IP, () => {
    console.log('Server started on port', PORT);
});
