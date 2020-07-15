# nodejs-exercise

This is an excersie in building a nodejs RESTful API.
All specifications can be found in the api_specifications_oas.yml OpenAPI file.

In short, it accesses the users table in a mysql database.
A user has the following fields:
1.	Id
2.	Name
3.	Email
4.	password
The service facilitates the following operations:
1.	Create a user
2.	Delete a user
3.	Get all users

The api can be run on docker by calling docker-compose command in the main folder (where docker-compose.yml file sits)

Once the dockers are up, you can run `npm test` to run basic tests on the api.
