const util = require('util');
const mysql = require('mysql');

function makeDB( config ) {
	const connection = mysql.createConnection( config );
	return {
		query( sql, args ) {
			return util.promisify( connection.query )
				.call( connection, sql, args );
		},
		close() {
			return util.promisify( connection.end )
				.call( connection );
		}
	};
}

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

module.exports = {
	Database,
	makeDB
}