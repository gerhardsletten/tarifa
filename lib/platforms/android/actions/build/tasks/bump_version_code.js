var Q = require('q'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    androidPathHelper = require('../../../lib/helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var androidConfs = msg.localSettings.configurations.android,
        version_code = androidConfs[msg.configuration].version_code;
    if(version_code) {
        var manifest = androidPathHelper.manifest(pathHelper.app());
        AndroidManifestBuilder.setVersionCode(manifest, version_code);
        log.send('success', '[android] change manifest versionCode to %s', version_code);
    }
    return Q.resolve(msg);
};
