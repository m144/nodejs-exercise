'use strict';
module.exports = app => {
	const users = require('../controllers/UsersController');
	const { deletionValidationRules, userValidationRules, validate } = require('../../validator.js');

	// user Routes
	app.get('/users', users.all);
	app.post('/users', userValidationRules(), validate, users.create);
	app.delete('/users/:userId', deletionValidationRules(), validate, users.delete);

	app.use((req, res) => {
		res.status(404).end();
	});
};
