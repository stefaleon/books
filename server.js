const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
const Book = require('./models/book');
const dbURL = process.env.dbURL || 'mongodb://localhost/books';
const methodOverride = require('method-override');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');



mongoose.connect(dbURL);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// auth setup
app.use(require('express-session')({
	secret: 'a book a day keeps the boredom away',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// ROUTES
//=============================================================

// main route
app.get('/', (req, res) => {
	 res.redirect('books');
});

// new book form
app.get('/newbook', isLoggedIn, (req, res) => {
	 res.render('new');
});

// edit book form
app.get('/books/:id/edit', isLoggedIn, (req, res) => {
	Book.findById(req.params.id,(err, foundBook) => {
		res.render('edit', { book: foundBook });
	});
});

// CREATE
//=============================================================
// create a book
app.post('/books', isLoggedIn, (req, res) => {
	console.log(req.body);
	var newBook = {
		title: req.body.title,
		author: req.body.author,
		category: req.body.category,
		publisher: req.body.publisher
	};
	Book.create(newBook, (err, newlyCreated) => {
		if (err) {
			console.log(err.message);
			res.status(400).send(err.message);
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
app.put('/books/:id', isLoggedIn, (req, res) => {
	console.log(req.body);
	var updatedBook = {
		title: req.body.title.trim(),
		author: req.body.author,
		category: req.body.category,
		publisher: req.body.publisher
	};
	if (req.body.title.trim().length > 0 ){
		Book.findByIdAndUpdate(req.params.id, updatedBook, function(err, updatedBook) {
			if (err) {
				console.log(err);
				res.redirect('/books');
			} else {
				console.log('Update Successful!');
				res.redirect('/books/' + req.params.id);
			}
		});
	} else {
		res.status(400).send("Book title cannot be empty.");
	}
});


// DESTROY
//=============================================================
// delete a book
app.delete('/books/:id', isLoggedIn, (req, res) => {
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



// auth routes
//=============================================================

// new user form
app.get('/signup', (req, res) => {
	res.render('register');
});

// CREATE a user
app.post('/signup', (req, res) => {
	var newUser = new User({username: req.body.username});
	// register method hashes the password
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		// if no error occurs, local strategy authentication takes place
		passport.authenticate('local')(req, res, () => {
			res.redirect('/');
		});
	});
});

// login form
app.get('/login', (req, res) => {
	res.render('login');
});

// user login
app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}), (req, res) => {
});

// user logout
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});


// authentication checking middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}



// app listen
app.listen(PORT, process.env.IP, () => {
    console.log('Server started on port', PORT);
});
