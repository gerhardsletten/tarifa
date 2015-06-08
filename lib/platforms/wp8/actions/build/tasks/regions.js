var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    WMAppManifestBuilder = require('../../../lib/xml/WMAppManifest.xml'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        regions = cordova.regions && cordova.regions.wp8 || ['en'],
        manifestPath = path.join(pathHelper.app(), 'platforms', 'wp8', 'Properties', 'WMAppManifest.xml');

    if(!regions) return msg;

    return WMAppManifestBuilder.setRegions(manifestPath, regions).then(function () {
        if(msg.verbose)
            print.success('set regions in WMAppManifest.xml');
        return msg;
    });
};
