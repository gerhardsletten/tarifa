var Q = require('q'),
    path = require('path'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var min_sdk_version = msg.localSettings.configurations.android[msg.configuration].min_sdk_version;
    if (min_sdk_version) {
        var versionSettings = require(path.join(__dirname, '../../../versions', msg.platformVersion, 'settings')),
            requiredVersion = versionSettings.minSdkVersion !== undefined ? versionSettings.minSdkVersion : 10;
        if (min_sdk_version >= requiredVersion) {
            var androidManifestXmlPath = path.join(pathHelper.app(), 'platforms/android/AndroidManifest.xml');
            AndroidManifestBuilder.setMinSdkVersion(androidManifestXmlPath, min_sdk_version);
            if (msg.verbose) {
                print.success('change minSdkVersion to %s', min_sdk_version);
            }
        } else {
            print.warning('could not set minSdkVersion to %s as platform android@%s requires version %s or later', min_sdk_version, msg.platformVersion, requiredVersion);
        }
    }
    return Q.resolve(msg);
};
