var Q = require('q'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    ConfigXmlBuilder = require('../../../../../xml/config.xml');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        conf = local.configurations[msg.platform][msg.configuration],
        config = (conf.cordova && conf.cordova.config) || cordova.config;

    if(config) {
        ConfigXmlBuilder.merge(pathHelper.configXML(), config);
        log.send('success', '[shared] extended config.xml');
    }

    return Q.resolve(msg);
};
