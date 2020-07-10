'use strict';
const mysql = require('mysql');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class Database {
	constructor(config) {
		this.con = mysql.createConnection(config);
	}
	query(sql, args) {
		return new Promise((resolve, reject) => {
			this.con.query(sql, args, (err, rows) => {
				if (err) {
					return reject(err);
				}
				resolve(rows);
			});
		});
	}
	close() {
		return new Promise((resolve, reject) => {
			this.con.end(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	}
}

const db = new Database({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'lytx'
});

exports.all = function(req, res) {
	db.query("SELECT id, name, email FROM users;").then(rows => {
		res.json(rows);
	});
}

exports.create = function(req, res) {
	console.log('inside create function');
	console.log(req.body);
	db
	.query("SELECT id FROM users WHERE email = ?",[req.body.email])
	.then(
		rows => {
			if (rows && rows.length) {
				res.status(422).send('User already exists');
			}
		},
		err => {
			res.status(500).send('DB Error');
		}
	)
	.then(() => {
		bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
			if (err) res.status(500).send(err);
	
			db
			.query("INSERT INTO users (name, email, password) VALUES (?,?,?);", [req.body.name, req.body.email, hash])
			.then(
				result => {
					return db.query("SELECT id, name, email FROM users WHERE id=?",[result.insertId]);
				},
				err => db.close().then( () => { res.status(500).send('Unable to add new user: ' + err.sqlMessage); } )
			)
			.then(
				rows => {
					var result = rows[0];
					res.status(201).json(result);
				}
			)
			.catch(err => {
				db.close().then( () => { res.status(500).send(err); } );
			});
		});
	})
	.catch(err => {
		db.close().then( () => { res.status(500).send(err); } );
	});
}

exports.delete = function(req, res) {
	if (req.params.userId) {
		db.query("DELETE FROM users WHERE id=?",[req.params.userId])
		.then(
			() => res.status(204).end(),
			err => res.status(500).send(err.sqlMessage)
		);
	} else {
		res.status(422).send('Wrong data received');
	}
}
