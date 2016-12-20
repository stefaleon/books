## Basic Books App 0.0.2.8

* Express
* EJS
* body-parser
* mongoose
* method-override
* express-session
* passport
* passport-local
* passport-local-mongoose


## 0.0.2.1
### Add a *User* model and configure authentication

* User model is added in *models/user.js*, along with the methods available in *passport-local-mongoose*.

```
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username:  {
		type: String,
		required: true,
		minlength: 4,
		trim: true
	},
    password:  {
		type: String,		
		minlength: 4,
		trim: true
	}
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

module.exports = User;
```


* Set up the *express-session* and *passport* authentication *use* commands in *server.js*.
```
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
```

* Username-Password authentication will be used to start with.
```
const LocalStrategy = require('passport-local');
```


## 0.0.2.2
### Add the *Sign Up* view and routes.

* A sign-up view is configured in *views/register.ejs*.
```
<form action='/signup' method='post'>
    <div class='form-group'>
        <input type='text' required name='username' pattern=".{4,}"
            placeholder="username, 4 chars minimum " class='form-control'/>
    </div>
    <div class='form-group'>
        <input type='password' required name='password' pattern=".{4,}"
            placeholder="password, 4 chars minimum" class='form-control' />
    </div>
    <div class="form-group">
        <input type="submit" value="Register" class="btn btn-success btn-block"/>
    </div>
</form>
```

* The sign-up routes are added to *server.js*.

```
// new user form
app.get('/signup', (req, res) => {
	res.render('register');
});

// CREATE a user
app.post('/signup', (req, res) => {
	res.json({
		username: req.body.username,
		password: req.body.password
	});
});
```
## 0.0.2.3
### Configure the *CREATE* user route

* The *register* method, which is included in the *passport-local-mongoose* dependency, is used to store the username and a hashed version of the submitted password in the database.

```
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
```

## 0.0.2.4
### Add the *Log In* routes.

* The login routes are added to *server.js*.

```
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
```

Users are now authenticated via the *authenticate* method, which is included in the *passport-local-mongoose* dependency.

```
passport.use(new LocalStrategy(User.authenticate()));
```

## 0.0.2.5
### Add the *Log Out* route and the *User Is Logged In* middleware

* The logout route is added to *server.js*.

```
// user logout
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});
```

Users are logged out by requesting the *logout* method, available through *passport*.

* The function *isLoggedIn* is using the *passport* method *isAuthenticated* to check if a request is indeed authenticated.

```
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}
```

* It is consequently used as middleware in the *CREATE*, *UPDATE* and *DESTROY* routes.

```
app.post('/books', isLoggedIn, (req, res) => {
    ...
    ...

app.put('/books/:id', isLoggedIn, (req, res) => {
    ...
    ...

app.delete('/books/:id', isLoggedIn, (req, res) => {
    ...
    ...    

```

It is also used as middleware in the form showing routes.

```
// new book form
app.get('/newbook', isLoggedIn, (req, res) => {
	 res.render('new');
});

// edit book form
app.get('/books/:id/edit', isLoggedIn, (req, res) => {
    ...
    ...
```

## 0.0.2.6
### Adjust views to *Current User*

*  *Passport*'s *req.user*, which is undefined if there is not a logged in user or an object containing the current user's id and username, is passed as *currentUser* to all locals, in order to be used in logic controlling the view, according to whether a user is logged in or not.  

```
// middleware for passing current user to all routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});
```

* Then the navigation bar is modified accordingly in *views/partials/header.ejs*, so that the *Log In* and *Sign Up* tabs are displayed when there is not a logged-in user, while the logged-in user name and the *Log Out* tab are displayed otherwise.

```
<ul class="nav navbar-nav navbar-right">
    <% if (!currentUser) { %>
       <li><a href="/login">Login</a></li>
       <li><a href="/register">Sign Up</a></li>
    <% } else { %>
       <li><a href="#"><strong><%= currentUser.username %></strong></a></li>
       <li><a href="/logout">Logout</a></li>
    <% } %>
</ul>
```
* Also when a book entry is displayed via *views/show.ejs*, the *Edit* and *Delete* buttons are displayed only when there is a logged-in user.

```
<% if (currentUser) { %>

    <a href='/books/<%= book._id %>/edit'>
        ...
        (edit and delete buttons)
        ...
        ...

<% } %>
```

## 0.0.2.7
### Associate books to users

* In order to associate each presented book to the user who made the addition, the book schema is updated in *models/book.js* so that it contains a *user* property that contains the username and a reference to the *User* model id.


```
const bookSchema = new mongoose.Schema({
	user: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	title: {
            ...
            ...
```

* In the *CREATE* route, the *user* properties (*_id* and *username*) are added to the *newBook* data.

```
app.post('/books', isLoggedIn, (req, res) => {
	console.log('req.body', req.body);
	console.log('req.user', req.user);
	var newBook = {
		user: {
			id: req.user._id,
			username: req.user.username
		},
		title: req.body.title,
		author: req.body.author,
		category: req.body.category,
		publisher: req.body.publisher
	};
	Book.create(newBook, (err, newlyCreated) => {
        ...
        ...
```

* Eventually, in *views/show.ejs*, the user who made the addition is shown.

```
    ...
    <% if (book.user.username) { %>
        <br /> <p> Added by: <%= book.user.username %> </p>
    <% } %>
```

## 0.0.2.8
### Make *edit* and *delete* functionality available only for authorized users

* In order to provide the functionality that users should only edit/delete the books they added and not other users' additions, authorization checking middleware is required. The *checkAuthorization* function checks whether a user is logged in or not, just as *isLoggedIn* does, but on top of that it introduces the relevant authorization logic.

```
// authorization checking middleware
// applicable for editing or deleting books created by the logged-in user
function checkAuthorization(req, res, next) {
	// if user is authenticated (logged-in)
	if (req.isAuthenticated()) {
		// find the book to check for authorization as well
		Book.findById(req.params.id, (err, foundBook) => {
			if (err) {
				res.redirect('back');
			} else {
				// if current user is the one who added the book
				if (foundBook.user.id && foundBook.user.id.equals(req.user._id)) {
					next();
				} else {
					res.redirect('back');
				}
			}
		});
	} else {
		res.redirect('back');
	}
}
```

* The *checkAuthorization* middleware method replaces the *isLoggedIn* method in the *UPDATE* and *DESTROY* routes and in the edit form showing route.

```
app.put('/books/:id', checkAuthorization, (req, res) => {
    ...
    ...

app.delete('/books/:id', checkAuthorization, (req, res) => {
    ...
    ...

app.get('/books/:id/edit', checkAuthorization, (req, res) => {
    ...
    ...
```

* For the UX improvement, in *views/show.ejs*, the *Edit* and *Delete* buttons are displayed only for authorized users.

```
<% if (currentUser && book.user.id && book.user.id.equals(currentUser._id)) { %>

    <a href='/books/<%= book._id %>/edit'>
            ...
            (edit and delete buttons)
            ...
            ...

<% } %>            
```

## TODO
* add *my books* tab
