var pathHelper = require('../../../../../helper/path'),
    fs = require('fs'),
    Configstore = new require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    dependency: 'wp8',
    condition: function (answer) {
        return answer.deploy;
    },
    type: 'input',
    name: 'certificate_path',
    validate: function (answer) {
        try {
            return fs.lstatSync(pathHelper.resolve(answer)).isFile() || 'file not found!';
        } catch(err) {
            return 'file not found!';
        }
    },
    filter: pathHelper.resolve,
    message: 'What is the company app distribution certificate path?',
    default: conf.get('certificate_path')
};
