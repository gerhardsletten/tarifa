var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    WMAppManifestBuilder = require('../../../lib/xml/WMAppManifest.xml'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var manifestPath = path.join(pathHelper.app(), 'platforms', 'wp8', 'Properties', 'WMAppManifest.xml'),
        configs = msg.localSettings.configurations.wp8,
        name = configs[msg.configuration]['product_name'],
        guid = configs[msg.configuration]['guid'],
        version = (configs[msg.configuration]['version'] || msg.localSettings.version) + '.0';

    return WMAppManifestBuilder.set(manifestPath, name, guid, version).then(function () {
        log.send('success', '[wp8] changed WMAppManifest.xml');
        return msg;
    });
};
