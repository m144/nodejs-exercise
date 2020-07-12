'use strict';
const bcrypt = require('bcrypt');
const { makeDB, Database } = require('../../database');
const saltRounds = 10;

const db = makeDB({
	host: process.env.MYSQL_DB_HOST,
	user: process.env.MYSQL_DB_USER,
	password: process.env.MYSQL_DB_PASS,
	database: process.env.MYSQL_DB_NAME
});

// new Database({
// 	host: process.env.MYSQL_DB_HOST,
// 	user: process.env.MYSQL_DB_USER,
// 	password: process.env.MYSQL_DB_PASS,
// 	database: process.env.MYSQL_DB_NAME
// });

exports.all = async function(req, res) {
	try {
		const users = await db.query("SELECT id, name, email FROM users;");
		res.json(users);
	}
	catch(e) {
		res.status(500).send(e);
	}
}

exports.create = async function(req, res) {
	var request = Object.assign({}, req.body);
	try {
		const users = await db.query("SELECT id FROM users WHERE email = ?",[request.email]);
		if (users && users.length) {
			return res.status(422).send('User already exists');
		}
		var hash = await bcrypt.hash(request.password, saltRounds);
		var result = await db.query("INSERT INTO users (name, email, password) VALUES (?,?,?);", [request.name, request.email, hash]);
		var inserted_user = await db.query("SELECT id, name, email FROM users WHERE id=?", [result.insertId]);
		return res.status(201).json(inserted_user[0]);
	}
	catch(err) {
		db.close().then( () => { res.status(500).send(err); } );
	}
	// .then(
	// 	rows => {
	// 		if (rows && rows.length) {
	// 			res.status(422).send('User already exists');
	// 			return true;
	// 		}
	// 		return false;
	// 	},
	// 	err => {
	// 		res.status(500).send('DB Error');
	// 	}
	// )
	// .then(quit => {
	// 	if (quit) return;

	// 	return bcrypt.hash(request.password, saltRounds, async (err, hash) => {
	// 		if (err) res.status(500).send('Hashing error');

	// 		return await db
	// 		.query("INSERT INTO users (name, email, password) VALUES (?,?,?);", [request.name, request.email, hash])
	// 		.then(
	// 			result => {
	// 				return db.query("SELECT id, name, email FROM users WHERE id=?",[result.insertId]);
	// 			},
	// 			err => db.close().then( () => { throw 'Unable to add new user: ' + err.sqlMessage; } )
	// 		)
	// 		.then(
	// 			rows => {
	// 				var result = rows[0];
	// 				return res.status(201).json(result);
	// 			}
	// 		)
	// 		.catch(err => {
	// 			db.close().then( () => { res.status(500).send(err); } );
	// 		});
	// 	});
	// })
	// .catch(err => {
	// 	await db.close().then( () => { res.status(500).send(err); } );
	// });
}

exports.check = async function(req, res) {
	const user = req.query;
	try {
		var result = await db.query("SELECT password FROM users WHERE email=?",[user.email]);
	}
	catch(e) {
		db.close().then( () => { res.status(500).send(e); } );
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
	} else {
		return res.status(422).send('Wrong data received');
	}
}
