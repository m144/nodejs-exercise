'use strict';
const bcrypt = require('bcrypt');
const Database = require('../../database');
const saltRounds = 10;

const db = new Database({
	host: process.env.MYSQL_DB_HOST,
	user: process.env.MYSQL_DB_USER,
	password: process.env.MYSQL_DB_PASS,
	database: process.env.MYSQL_DB_NAME
});

exports.all = function(req, res) {
	db.query("SELECT id, name, email FROM users;").then(rows => {
		res.json(rows);
	});
}

exports.create = function(req, res) {
	var request = Object.assign({},req.body);
	db
	.query("SELECT id FROM users WHERE email = ?",[request.email])
	.then(
		rows => {
			if (rows && rows.length) {
				res.status(422).send('User already exists');
				return true;
			}
			return false;
		},
		err => {
			res.status(500).send('DB Error');
		}
	)
	.then(quit => {
		if (quit) return;

		return bcrypt.hash(request.password, saltRounds, async (err, hash) => {
			if (err) res.status(500).send('Hashing error');

			return await db
			.query("INSERT INTO users (name, email, password) VALUES (?,?,?);", [request.name, request.email, hash])
			.then(
				result => {
					return db.query("SELECT id, name, email FROM users WHERE id=?",[result.insertId]);
				},
				err => db.close().then( () => { throw 'Unable to add new user: ' + err.sqlMessage; } )
			)
			.then(
				rows => {
					var result = rows[0];
					return res.status(201).json(result);
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
		if (isNaN(req.params.userId)) {
			return res.status(422).send('Wrong data received');
		}
		db.query("DELETE FROM users WHERE id=?", [req.params.userId])
		.then(
			() => res.status(204).end(),
			err => db.close().then( () => { res.status(500).send('Unable to delete new user: ' + err.sqlMessage); } )
		)
		.catch(err => db.close().then( () => { res.status(500).send('Unable to delete new user: ' + err.sqlMessage); } ));
	} else {
		return res.status(422).send('Wrong data received');
	}
}
