var plugins = require('../../../lib/cordova/plugins');

module.exports = {
    type: 'checkbox',
    name: 'plugins',
    choices: plugins.listAvailable(),
    message: 'Which plugins do you want to install right now?'
};
