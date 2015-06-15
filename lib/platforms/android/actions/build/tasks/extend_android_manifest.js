var Q = require('q'),
    path = require('path'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        conf = local.configurations.android[msg.configuration],
        settings = (conf.cordova && conf.cordova.settings)
            || (cordova.settings && cordova.settings.android);

    if(!settings) return Q.resolve(msg);

    var androidManifestXmlPath = path.join(pathHelper.app(), 'platforms/android/AndroidManifest.xml');
    AndroidManifestBuilder.merge(androidManifestXmlPath, settings);

    if(msg.verbose)
        print.success('extended AndroidManifest.xml');

    return Q.resolve(msg);
};
