var Q = require('q'),
    path = require('path'),
    settings = require('../../../../../settings'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    mergeObject = require('../../../../../helper/collections').mergeObject;
    ConfigBuilder = require('../../../../../xml/config.xml');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations[msg.platform][msg.configuration],
        id = conf.id,
        author = msg.localSettings.author.name,
        author_email = msg.localSettings.author.email,
        author_href = msg.localSettings.author.href,
        description = msg.localSettings.description,
        version = conf.version || msg.localSettings.version,
        preferences = msg.localSettings.cordova.preferences,
        whitelist = msg.localSettings.cordova.whitelist,
        config_xml_path = path.join(pathHelper.app(), 'config.xml');

    if (conf.cordova) {
        if (conf.cordova.preferences) {
            preferences = mergeObject(preferences, conf.cordova.preferences);
        }
        if (conf.cordova.whitelist) {
            whitelist[msg.platform] = conf.cordova.whitelist;
        }
    }

    return ConfigBuilder.set(
        config_xml_path,
        id,
        version,
        author,
        author_email,
        author_href,
        description,
        preferences,
        whitelist,
        msg.watch || null
    ).then(function () {
        if(msg.verbose)
            print.success('modifying config.xml');
        return msg;
    }, function(err) {
        if(msg.verbose)
            print.error('Error when trying to modify config.xml: ' + err);
        return Q.reject(err);
    });
};
