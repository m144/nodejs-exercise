const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/UserRoutes');
routes(app);

app.listen(port);

console.log('app api started on port ' + port);
