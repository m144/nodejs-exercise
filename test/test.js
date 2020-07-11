'use strict';
const app = require('../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
    ;
chai.use(chaiHttp);
//chai.use(chaiSubset);
describe('Testing User REST API', function () {
    after(() => {});
    var url = 'http://localhost:3000';
    var requester = chai.request.agent(url);//to keep the same session; without requester agent the get or post will act as opening a new window
    
	//When done is passed in, Mocha will wait until the call to done(), or until the timeout expires. 
	// done also accepts an error parameter when signaling completion.
    const users = {
		correct_user: {
			name:'Tester Testerov',
			email:'not@home.com',
			password:'password123'
		},
		correct_user_2: {
			name:'Chuck Testa',
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
			name:'Tester Testerov',
			email:'not@home.com'
		},
		missing_email_user: {
			name:'Tester Testerov',
			password:'password123'
		},
		wrong_email_format_user: {
			name:'Tester Testerov',
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
				expect(res).to.have.status(422);
				expect(res.text).to.equal('User already exists');
                done();
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
				if (err) throw err;
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
            });
	});
	it('should delete a user successfully', function (done) { // <= Pass in done callback
        requester
            .delete('/users/' + user_id)
            .end(function (err, res) {
				if (err) throw err;
                expect(res).to.have.status(204);
                done(); // <= Call done to signal callback end
            });
	});
	it('should return a list of users successfully without the new added user', function (done) { // <= Pass in done callback
        requester
            .get('/users')
            .end(function (err, res) {
				if (err) throw err;
				expect(res).to.have.status(200);
				var response = JSON.parse(res.text);
				expect(response).not.to.include.deep.members([{
					id:user_id,
					name:user.name,
					email:user.email
				}]);
                done(); // <= Call done to signal callback end
            });
	});
	it('should delete the second user successfully', function (done) { // <= Pass in done callback
        requester
            .delete('/users/' + user_id_2)
            .end(function (err, res) {
				if (err) throw err;
                expect(res).to.have.status(204);
                done(); // <= Call done to signal callback end
            });
	});
	it('should return a list of users successfully without the second added user', function (done) { // <= Pass in done callback
        requester
            .get('/users')
            .end(function (err, res) {
				if (err) throw err;
				expect(res).to.have.status(200);
				var response = JSON.parse(res.text);
				expect(response).not.to.include.deep.members([{
					id:user_id_2,
					name:users.correct_user_2.name,
					email:users.correct_user_2.email
				}]);
                done(); // <= Call done to signal callback end
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
				expect(result.errors[0].password).to.equal('no email given');
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