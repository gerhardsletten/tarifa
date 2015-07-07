var path = require('path');

module.exports.beforeCompile = function (conf, options) {
    var versions = require(path.resolve(__dirname, '../../package.json')).versions;
    if(versions.indexOf(conf.platformVersion) > -1) {
        return require(path.resolve(__dirname, '../../versions', conf.platformVersion, 'settings')).beforeCompile(conf, options);
    }
    else {
        process.env.ANDROID_BUILD = 'gradle';
        return options;
    }
};

/* tasks definition */
module.exports.tasks = {
    'pre-cordova-prepare': [
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons',
        'lib/platforms/shared/actions/build/tasks/copy_splashscreens',
        'lib/platforms/android/actions/build/tasks/change_template_activity',
        'lib/platforms/android/actions/build/tasks/release-properties'
    ],
    'pre-cordova-compile': [
        'lib/platforms/android/actions/build/tasks/app_label',
        'lib/platforms/android/actions/build/tasks/bump_version_code',
        'lib/platforms/android/actions/build/tasks/set_min_sdk_version',
        'lib/platforms/android/actions/build/tasks/extend_android_manifest'
    ],
    'post-cordova-compile': [
        'lib/platforms/android/actions/build/tasks/copy_apk'
    ],
    'undo': [
        'lib/platforms/shared/actions/build/tasks/reset_config_xml',
        'lib/platforms/android/actions/build/tasks/reset_release_properties'
    ]
};
