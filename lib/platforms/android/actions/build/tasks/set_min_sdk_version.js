var Q = require('q'),
    path = require('path'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    androidPathHelper = require('../../../lib/helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var min_sdk_version = msg.localSettings.configurations.android[msg.configuration].min_sdk_version;
    if (!min_sdk_version) return Q.resolve(msg);

    var versionSettings = require(path.join(__dirname, '../../../versions', msg.platformVersion, 'settings')),
        requiredVersion = versionSettings.minSdkVersion !== undefined ? versionSettings.minSdkVersion : 10;
    if (min_sdk_version >= requiredVersion) {
        AndroidManifestBuilder.setMinSdkVersion(
            androidPathHelper.manifest(pathHelper.app()),
            min_sdk_version
        );
        log.send('success', '[android] change minSdkVersion to %s', min_sdk_version);
    } else {
        log.send('warning',
            '[android] can not set minSdkVersion to %s as android@%s requires version %s or later',
            min_sdk_version,
            msg.platformVersion,
            requiredVersion
        );
    }
    return Q.resolve(msg);
};
