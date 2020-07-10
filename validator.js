const { body, validationResult } = require('express-validator')
const userValidationRules = () => {
	console.log('validating rules');
	return [
		body('name', 'name not specified').exists().not().isEmpty(),
		body('email', 'Invalid email').exists().isEmail().normalizeEmail(),
		body('password', 'password not specified').exists().not().isEmpty()
	];
};

const validate = (req, res, next) => {
	console.log('validate called');
	const errors = validationResult(req);
	console.log(errors);
	if (errors.isEmpty()) {
		console.log('no errors');
		return next();
	}
	const extractedErrors = [];
	errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

	return res.status(422).json({
		errors: extractedErrors,
	});
}

module.exports = {
	userValidationRules,
	validate,
}