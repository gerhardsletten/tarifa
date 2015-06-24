var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    WMAppManifestBuilder = require('../../../lib/xml/WMAppManifest.xml'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        conf = local.configurations.wp8[msg.configuration],
        manifestPath = path.join(
            pathHelper.app(),
            'platforms',
            'wp8',
            'Properties',
            'WMAppManifest.xml'
        ),
        regions = (conf.cordova && conf.cordova.regions)
            || (cordova.regions && cordova.regions.wp8 || ['en']);

    if(!regions) return msg;

    return WMAppManifestBuilder.setRegions(manifestPath, regions).then(function () {
        log.send('success', '[wp8] set regions in WMAppManifest.xml');
        return msg;
    });
};
