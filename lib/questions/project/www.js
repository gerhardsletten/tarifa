var path = require('path'),
    Configstore = require('configstore');

var tarifaTemplate = {
    name: 'Default tarifa template',
    value: path.join(__dirname, '../../../template/project')
};

module.exports = {
    type: 'list',
    name: 'www',
    choices: function () {
        var conf = new Configstore('tarifa'),
            templates = conf.get('templates');
        if(templates) return [tarifaTemplate].concat(templates);
        else return [tarifaTemplate];
    },
    default: 0,
    message: 'Choose your www project template:'
};
