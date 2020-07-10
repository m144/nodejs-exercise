'use strict';
module.exports = function(app) {
  const users = require('../controllers/UsersController');
  const { userValidationRules, validate } = require('../../validator.js');

  // user Routes
  app.get('/users', users.all);
  app.post('/users', userValidationRules(), validate, users.create);


  app.route('/users/:userId')
    .delete(users.delete);
};
