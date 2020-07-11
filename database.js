const mysql = require('mysql');

module.exports = class Database {
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