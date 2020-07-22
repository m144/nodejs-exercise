'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: {
		type: String,
		required: 'Please enter your name'
	},
	email: {
		type: String,
		required: 'Please enter your email'
	},
	password: {
		type: String,
		required: 'Please enter a password'
	}
});

module.exports = mongoose.model('User', UserSchema);