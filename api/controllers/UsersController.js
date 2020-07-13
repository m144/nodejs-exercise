'use strict';
const bcrypt = require('bcrypt');
const { Database } = require('../../database');
const saltRounds = 10;

function openDBConnection() {
	return new Database({
		host: process.env.MYSQL_DB_HOST,
		port: process.env.MYSQL_DB_PORT,
		user: process.env.MYSQL_DB_USER,
		password: process.env.MYSQL_DB_PASS,
		database: process.env.MYSQL_DB_NAME
	});
}

exports.all = async function(req, res) { 
	try {
		const db = openDBConnection();
		const users = await db.query("SELECT id, name, email FROM users;");
		res.json(users);
	}
	catch(err) {
		res.status(500).send(err);
	}
}

exports.create = async function(req, res) {
	var request = req.body;
	try {
		const db = openDBConnection();
		const users = await db.query("SELECT id FROM users WHERE email = ?",[request.email]);
		if (users && users.length) {
			await db.close();
			return res.status(422).send('User already exists');
		}
		var hash = await bcrypt.hash(request.password, saltRounds);
		var result = await db.query("INSERT INTO users (name, email, password) VALUES (?,?,?);", [request.name, request.email, hash]);
		var inserted_user = await db.query("SELECT id, name, email FROM users WHERE id=?", [result.insertId]);
		await db.close();
		return res.status(201).json(inserted_user[0]);
	}
	catch(err) {
		res.status(500).send(err);
	}
}

exports.check = async function(req, res) {
	const user = req.query;
	try {
		const db = openDBConnection();
		var result = await db.query("SELECT password FROM users WHERE email=?",[user.email]);
	}
	catch(err) {
		res.status(500).send(err);
	}
	if (result && result.length) {
		bcrypt.compare(user.password, result[0].password, (err, matches) => {
			if (matches) {
				return res.status(200).send('user ok');
			} else {
				return res.status(422).send('incorrect password');
			}
		});
	} else {
		return res.status(422).send('unknown user');
	}

}

exports.delete = async function(req, res) {
	if (req.params.userId) {
		const db = openDBConnection();
		if (isNaN(req.params.userId)) {
			return res.status(422).send('Wrong data received');
		}
		await db.query("DELETE FROM users WHERE id=?", [req.params.userId])
		.then(
			() => res.status(204).end(),
			err => db.close().then( () => { res.status(500).send('Unable to delete new user: ' + err.sqlMessage); } )
		)
	} else {
		return res.status(422).send('Wrong data received');
	}
}
