const { body, validationResult } = require('express-validator')
const userValidationRules = () => {
	return [
		body('name')
			.exists().withMessage('no name given')
			.not().isEmpty().withMessage('empty name'),
		body('email')
			.exists().withMessage('no email given')
			.not().isEmpty().withMessage('empty email')
			.isEmail().withMessage('invalid email')
			.normalizeEmail(),
		body('password')
			.exists().withMessage('no password given')
			.not().isEmpty().withMessage('empty password')
	];
};

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
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