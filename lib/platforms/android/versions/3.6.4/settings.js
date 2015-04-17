var path = require('path'),
    pathHelper = require('../../../../helper/path');

module.exports.apk_output_folder = function () {
    return path.join(pathHelper.app(), 'platforms', 'android', 'build', 'apk');
};

module.exports.beforeCompile = function (conf, options) {
    process.env.ANDROID_BUILD = 'gradle';
    return options;
};

module.exports.minSdkVersion = 10;

module.exports.signingTemplate = "keystore=%s\nkey.alias=%s\nkeystore.password=%s\nkey.password=%s";
