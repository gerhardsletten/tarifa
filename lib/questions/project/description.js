var validator = require('../../../lib/helper/validator'),
    validateDescription = validator.toInquirerValidateƒ(validator.isDescription);

module.exports = {
    type: 'input',
    name: 'description',
    validate: function (answer) {
        return !answer.length || validateDescription(answer);
    },
    message: 'What\'s your project about?'
};
