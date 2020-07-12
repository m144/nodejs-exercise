'use strict';
const app = require('../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
	;

const Database = require('../database');

const db = new Database({
	host: process.env.MYSQL_DB_HOST,
	user: process.env.MYSQL_DB_USER,
	password: process.env.MYSQL_DB_PASS,
	database: process.env.MYSQL_DB_NAME
});

chai.use(chaiHttp);
//chai.use(chaiSubset);
describe('Testing User REST API', function () {
	before('starting delete test entities',() => {
		console.log('deleting test entities');
		return db.query("DELETE FROM users WHERE name LIKE 'test_entity%';").then(() => {}, err => {throw err;});
	});
    after(() => {});
    var url = 'http://localhost:3000';
    var requester = chai.request.agent(url);//to keep the same session; without requester agent the get or post will act as opening a new window
    
	//When done is passed in, Mocha will wait until the call to done(), or until the timeout expires. 
	// done also accepts an error parameter when signaling completion.
    const users = {
		correct_user: {
			name:'test_entity1',
			email:'not@home.com',
			password:'password123'
		},
		correct_user_2: {
			name:'test_entity2',
			email:'chuck.not@home.com',
			password:'passchuck123'
		},
		missing_name_user: {
			email:'not@home.com',
			password:'password123'
		},
		empty_name_user: {
			name: '',
			email:'not@home.com',
			password:'password123'
		},
		missing_password_user: {
			name:'test_entity3',
			email:'not@home.com'
		},
		missing_email_user: {
			name:'test_entity4',
			password:'password123'
		},
		wrong_email_format_user: {
			name:'test_entity5',
			email:'not@home',
			password:'password123'
		}
	};
	var user_id = null;
	var user_id_2 = null;
    it('should add a new user to the users table successfully', function (done) { // <= Pass in done callback
		requester
            .post('/users')
            .send(users.correct_user)
            .then(res => {
				expect(res).to.have.status(201);
				var response = JSON.parse(res.text);
				expect(response.name).to.equal(users.correct_user.name);
				expect(response.email).to.equal(users.correct_user.email);
				user_id = response.id;
				done();
            }, err => {
				console.log(err);
				done();
			}).catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should fail adding the same user to the users table', function (done) { // <= Pass in done callback
		requester
            .post('/users')
            .send(users.correct_user)
            .then(res => {
				try {
					expect(res).to.have.status(422);
					expect(res.text).to.equal('User already exists');
					done();
				}
				catch(e) {
					done(e);
				}
            }, err => {
				console.log(err);
				done();
			}).catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should add another new user to the users table successfully', function (done) { // <= Pass in done callback
		requester
            .post('/users')
            .send(users.correct_user_2)
            .then(res => {
				expect(res).to.have.status(201);
				var response = JSON.parse(res.text);
				expect(response.name).to.equal(users.correct_user_2.name);
				expect(response.email).to.equal(users.correct_user_2.email);
				user_id_2 = response.id;
                done();
            }, err => {
				console.log(err);
				done();
			}).catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should return a list of users successfully', function (done) { // <= Pass in done callback
        requester
            .get('/users')
            .end(function (err, res) {
				if (err) {
					console.log(err);
					done(err);
				}
				try {
					expect(res).to.have.status(200);
					var response = JSON.parse(res.text);
					expect(response).to.include.deep.members([{
						id:user_id,
						name:users.correct_user.name,
						email:users.correct_user.email
					},{
						id:user_id_2,
						name:users.correct_user_2.name,
						email:users.correct_user_2.email
					}]);
					done(); // <= Call done to signal callback end
				}
				catch(e) {
					done(e);
				}
            });
	});
	it('should delete a user successfully', function (done) { // <= Pass in done callback
        requester
            .delete('/users/' + user_id)
            .end(function (err, res) {
				if (err) {
					console.log(err);
					done(err);
				}
				try {
					expect(res).to.have.status(204);
					done(); // <= Call done to signal callback end
				}
				catch(e) {
					done(e);
				}
            });
	});
	it('should return a list of users successfully without the new added user', function (done) { // <= Pass in done callback
        requester
            .get('/users')
            .end(function (err, res) {
				if (err) {
					console.log(err);
					done(err);
				}
				try {
					expect(res).to.have.status(200);
					var response = JSON.parse(res.text);
					expect(response).not.to.include.deep.members([{
						id:user_id,
						name:users.correct_user.name,
						email:users.correct_user.email
					}]);
					done(); // <= Call done to signal callback end
				}
				catch(e) {
					done(e);
				}
            });
	});
	it('should delete the second user successfully', function (done) { // <= Pass in done callback
        requester
            .delete('/users/' + user_id_2)
            .end(function (err, res) {
				if (err) {
					console.log(err);
					done(err);
				}
				try {
					expect(res).to.have.status(204);
					done(); // <= Call done to signal callback end
				}
				catch(e) {
					done(e);
				}
            });
	});
	it('should return a list of users successfully without the second added user', function (done) { // <= Pass in done callback
        requester
            .get('/users')
            .end(function (err, res) {
				if (err) {
					console.log(err);
					done(err);
				}
				try {
					expect(res).to.have.status(200);
					var response = JSON.parse(res.text);
					expect(response).not.to.include.deep.members([{
						id:user_id_2,
						name:users.correct_user_2.name,
						email:users.correct_user_2.email
					}]);
					done(); // <= Call done to signal callback end
				}
				catch(e) {
					done(e);
				}
            });
	});
	it('should fail deleting wrong id', function (done) { // <= Pass in done callback
        requester
            .delete('/users/not_an_id')
            .end(function (err, res) {
				if (err) {
					console.log(err);
					done(err);
				}
				try {
					expect(res).to.have.status(422);
					expect(res.text).to.equal('Wrong data received')
					done(); // <= Call done to signal callback end
				}
				catch(e) {
					done(e);
				}
            });
	});
	it('should fail adding user without name to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(users.missing_name_user)
            .then(res => {
				expect(res).to.have.status(422);
				var result = JSON.parse(res.text);
				expect(result.errors[0].name).to.equal('no name given');
				done();
            }, err => {
				console.log(err);
				done();
			})
			.catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should fail adding user with empty name to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(users.empty_name_user)
            .then(res => {
				expect(res).to.have.status(422);
				var result = JSON.parse(res.text);
				expect(result.errors[0].name).to.equal('empty name');
				done();
            }, err => {
				console.log(err);
				done();
			})
			.catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should fail adding user without password to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(users.missing_password_user)
            .then(res => {
				expect(res).to.have.status(422);
				var result = JSON.parse(res.text);
				expect(result.errors[0].password).to.equal('no password given');
				done();
            }, err => {
				console.log(err);
				done();
			})
			.catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should fail adding user without email to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(users.missing_email_user)
            .then(res => {
				expect(res).to.have.status(422);
				var result = JSON.parse(res.text);
				expect(result.errors[0].email).to.equal('no email given');
				done();
            }, err => {
				console.log(err);
				done();
			})
			.catch((err) => {
				console.log(err);
				done();
			});
	});
	it('should fail adding user without email to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(users.wrong_email_format_user)
            .then(res => {
				expect(res).to.have.status(422);
				var result = JSON.parse(res.text);
				expect(result.errors[0].email).to.equal('invalid email');
				done();
            }, err => {
				console.log(err);
				done();
			})
			.catch((err) => {
				console.log(err);
				done();
			});
	});
});