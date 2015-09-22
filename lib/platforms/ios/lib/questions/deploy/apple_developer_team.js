var validator = require('../../../../../helper/validator'),
    validateAppleDeveloperTeam = validator.toInquirerValidateƒ(validator.isAppleDeveloperTeam),
    Configstore = require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    dependency: 'ios',
    condition: function (answer) {
        return answer.deploy && answer.has_apple_developer_team && answer.cupertino;
    },
    type: 'input',
    name: 'apple_developer_team',
    validate: validateAppleDeveloperTeam,
    message: 'What is your developer apple team id?',
    default: conf.get('apple_developer_team')
};
