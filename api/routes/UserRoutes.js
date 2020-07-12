'use strict';
module.exports = app => {
	const users = require('../controllers/UsersController');
	const { userValidationRules, validate } = require('../../validator.js');

	// user Routes
	app.get('/users', users.all);
	app.post('/users', userValidationRules(), validate, users.create);
	app.delete('/users/:userId', users.delete);

	app.use((req, res) => {
		res.status(404).send({url: req.originalUrl + ' not found'});
	});
};
