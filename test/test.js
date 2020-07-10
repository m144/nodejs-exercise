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
    const user = {
		name:'Tester Testerov',
		email:'not@home.com',
		password:'password123'
	};
	var user_id = null;
    it('should add a new user to the users table successfully', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(user)
            .then(res => {
				expect(res).to.have.status(201);
				var response = JSON.parse(res.text);
				expect(response.name).to.equal(user.name);
				expect(response.email).to.equal(user.email);
				user_id = response.id;
				console.log('added user to db');
                done();
            }, err => {
				console.log(err);
			});
	});
	it('should fail adding the same user to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(user)
            .then(res => {
				expect(res).to.have.status(422);
				expect(res.text).to.equal('User already exists');
				console.log('same user not added to db');
                done();
            }, err => {
				console.log(err);
			});
	});
	it('should return a list of users successfully', function (done) { // <= Pass in done callback
        requester
            .get('/users')
            .end(function (err, res) {
				if (err) throw err;
				expect(res).to.have.status(200);
				var response = JSON.parse(res.text);
				//expect(response).to.include.members([{name:user.name,email:user.email}]);
				expect(response).to.include.deep.members([{
					id:user_id,
					name:user.name,
					email:user.email
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
				console.log('deleted user ' + user_id + ' from db');
                done(); // <= Call done to signal callback end
            });
	});
	const user2 = {
		email:'not@home.com',
		password:'password123'
	};
	it('should fail adding user without name to the users table', function (done) { // <= Pass in done callback
        requester
            .post('/users')
            .send(user2)
            .then(res => {
				expect(res).to.have.status(422);
				expect(res.text).to.equal('name not specified');
				console.log('name not specified');
                done();
            }, err => {
				console.log(err);
			});
	});
});