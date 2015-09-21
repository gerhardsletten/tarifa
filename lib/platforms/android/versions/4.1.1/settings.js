var path = require('path'),
    pathHelper = require('../../../../helper/path');

module.exports.apk_output_folder = function () {
    return path.join(pathHelper.app(), 'platforms', 'android', 'build', 'outputs', 'apk');
};

module.exports.beforeCompile = function (conf, options) {
    process.env.ANDROID_BUILD = 'gradle';
    options.push('--gradle');
    if(conf.localSettings.configurations[conf.platform]
        && conf.localSettings.configurations[conf.platform]
        && conf.localSettings.configurations[conf.platform][conf.configuration].sign) {
        options.push('--gradleArg=-PcdvReleaseSigningPropertiesFile=release.properties');
    }
    return options;
};

module.exports.minSdkVersion = 10;

module.exports.signingTemplate = 'storeFile=%s\nkeyAlias=%s\nstorePassword=%s\nkeyPassword=%s';
