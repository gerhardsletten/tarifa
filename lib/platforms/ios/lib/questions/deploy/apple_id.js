var validator = require('../../../../../helper/validator'),
    validateEmail = validator.toInquirerValidateƒ(validator.isEmail),
    Configstore = require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    dependency: 'ios',
    condition: function (answer) {
        return answer.deploy;
    },
    type: 'input',
    name: 'apple_id',
    message: 'What is your developer apple id?',
    validate: validateEmail,
    default: conf.get('apple_id')
};
