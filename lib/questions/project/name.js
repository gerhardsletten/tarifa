var validator = require('../../../lib/helper/validator'),
    validateJavaIdentifier = validator.toInquirerValidateƒ(validator.isJavaIdentifier);

module.exports = {
    type: 'input',
    name: 'name',
    validate: validateJavaIdentifier,
    message: 'What\'s the name of your project?'
};
