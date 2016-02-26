var validator = require('../../../../../helper/validator'),
    validateEmail = validator.toInquirerValidateƒ(validator.isEmail),
    Configstore = require('configstore'),
    nomadAvailable = require('../../nomad/available'),
    log = require('../../../../../helper/log'),
    conf = new Configstore('tarifa');

module.exports = function (response) {
    return nomadAvailable().then(function () {
        response.cupertino = true;
        return response;
    }, function () {
        if(process.platform === 'darwin') {
            log.send('warning', 'Cupertino gem not installed!');
            log.send('warning', 'Skipping ios signing questions...');
        }
        response.cupertino = false;
        return response;
    }).then(function () {
        return {
            dependency: 'ios',
            condition: function (answer) {
                return answer.deploy && answer.cupertino;
            },
            type: 'input',
            name: 'apple_id',
            message: 'What is your developer apple id?',
            validate: validateEmail,
            default: conf.get('apple_id')
        };
    });
};
