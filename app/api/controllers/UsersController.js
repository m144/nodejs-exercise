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
		var request = req.query;
		console.log(request);
		var users;
		const db = openDBConnection();
		if (request && request.length) {
			var query = "SELECT id, name, email FROM users";
			if (request.limit) {
				query += " LIMIT " + request.limit;
			}
			if (request.from) {
				query += " OFFSET " + request.from;
			}
			users = await db.query(query);
		} else {
			users = await db.query("SELECT id, name, email FROM users;");
		}
		res.json(users);
	}
	catch(err) {
		console.log(err);
		res.status(500).end();
	}
}

exports.create = async function(req, res) {
	var request = req.body;
	if (request.user) {
		request = request.user;
	}
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
