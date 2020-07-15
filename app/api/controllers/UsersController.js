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
		await db.close();
		return res.json(users);
	}
	catch(err) {
		console.log(err);
		return res.status(500).end();
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
		console.log(err);
		return res.status(500).end();
	}
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
