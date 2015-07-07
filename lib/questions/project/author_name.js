var Configstore = require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    type: 'input',
    name: 'author_name',
    message: 'What\'s your name?',
    default: conf.get('author_name')
};
