var validator = require('../../../lib/helper/validator'),
    validateUrl = validator.toInquirerValidateƒ(validator.isUrl),
    Configstore = require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    type: 'input',
    name: 'author_href',
    message: 'What\'s your website?',
    validate: function (answer) {
        return !answer.length || validateUrl(answer);
    },
    default: conf.get('author_href')
};
