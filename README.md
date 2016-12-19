## Basic Books App 0.0.2.6

* Express
* EJS
* body-parser
* mongoose
* method-override
* express-session
* passport
* passport-local
* passport-local-mongoose


## 0.0.2.1 commit

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

* Username-Password authentication wll be used to start with.
```
const LocalStrategy = require('passport-local');
```


## 0.0.2.2 commit

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
## 0.0.2.3 commit

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

## 0.0.2.4 commit

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

## 0.0.2.5 commit

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

## 0.0.2.6 commit

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





## TODO
* associate books to users
* add *my books* tab
* users should only edit/delete the books they added and not other users' additions.
