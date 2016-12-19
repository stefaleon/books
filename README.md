## Basic Books App 0.0.2.2

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
		required: true,
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
