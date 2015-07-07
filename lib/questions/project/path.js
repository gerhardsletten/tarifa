var validator = require('../../../lib/helper/validator'),
    pathHelper = require('../../../lib/helper/path'),
    validateProjectPath = validator.toInquirerValidateƒ(validator.isNonExistingOrEmptyFolderPath);

module.exports = {
    type: 'input',
    name: 'path',
    validate: validateProjectPath,
    message: 'Where do you want to create your project?',
    filter: pathHelper.resolve
};
