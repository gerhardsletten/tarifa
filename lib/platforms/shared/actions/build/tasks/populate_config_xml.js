var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    mergeObject = require('../../../../../helper/collections').mergeObject,
    ConfigBuilder = require('../../../../../xml/config.xml');

module.exports = function (msg) {
    var local = msg.localSettings,
        conf = local.configurations[msg.platform][msg.configuration],
        id = conf.id,
        author = local.author.name,
        author_email = local.author.email,
        author_href = local.author.href,
        description = local.description,
        version = conf.version || local.version,
        preferences = local.cordova.preferences,
        whitelist = local.cordova.whitelist,
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
        log.send('success', 'modifying config.xml');
        return msg;
    }, function(err) {
        log.send('error', 'Error when trying to modify config.xml: ' + err);
        return Q.reject(err);
    });
};
