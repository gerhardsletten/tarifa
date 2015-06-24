var Q = require('q'),
    path = require('path'),
    settings = require('../../../../../settings'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    ConfigBuilder = require('../../../../../xml/config.xml');

module.exports = function (msg) {
    var local = msg.localSettings;

    return ConfigBuilder.set(
        path.join(pathHelper.app(), 'config.xml'),
        local.id,
        local.version,
        local.author.name,
        local.author.email,
        local.author.href,
        local.description,
        local.cordova.preferences,
        local.cordova.whitelist,
        'index.html'
    ).then(function () {
        log.send('success', 'reset config.xml to global values');
        return msg;
    });
};
