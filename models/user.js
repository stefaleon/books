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
