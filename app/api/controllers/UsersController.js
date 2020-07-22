'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;

var mongoose = require('mongoose'),
	User = mongoose.model('User');

exports.all = function(req, res) {
	User.find({}, (err, users) => {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
}

exports.create = async function(req, res) {
	var new_user = new User(req.body);
	var hash = await bcrypt.hash(new_user.get('password'), saltRounds);
	new_user.set('password', hash);
	new_user.save((err, user) => {
		if (err) {
			res.send(err);
		}
		res.json(user);
	});
}

exports.delete = async function(req, res) {
	try {
		const db = openDBConnection();
		var user = await db.query("SELECT id FROM users WHERE id=?", [req.params.userId]);
		if (!user || !user.length) {
			await db.close();
			return res.status(404).send('User not found');
		}
		await db.query("DELETE FROM users WHERE id=?", [req.params.userId]);
		await db.close();
		return res.status(204).end();
	}
	catch(err) {
		console.log(err);
		return res.status(500).end();
	}
}
