var Q = require('q'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    androidPathHelper = require('../../../lib/helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        conf = local.configurations.android[msg.configuration],
        settings = (conf.cordova && conf.cordova.settings)
            || (cordova.settings && cordova.settings.android);

    if(!settings) return Q.resolve(msg);

    AndroidManifestBuilder.merge(
        androidPathHelper.manifest(pathHelper.app()),
        settings
    );

    log.send('success', '[android] extended AndroidManifest.xml');

    return Q.resolve(msg);
};
