var Q = require('q'),
    path = require('path'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {

    var local = msg.localSettings,
        cordova = local.cordova || {},
        androidSettings = cordova.settings && cordova.settings.android;

    if(!androidSettings) return Q.resolve(msg);

    var androidManifestXmlPath = path.join(pathHelper.app(), 'platforms/android/AndroidManifest.xml');
    AndroidManifestBuilder.merge(androidManifestXmlPath, androidSettings);

    if(msg.verbose)
        print.success('extended AndroidManifest.xml');

    return Q.resolve(msg);
};
