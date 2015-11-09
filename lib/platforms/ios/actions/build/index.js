var path = require('path');

module.exports.beforeCompile = function (conf, options) {
    options.device = true;
    options.argv = [ '--nosign' ];
    var versions = require(path.resolve(__dirname, '../../package.json')).versions,
        mod = path.resolve(__dirname, '../../versions', conf.platformVersion, 'settings');
    if(versions.indexOf(conf.platformVersion) > -1) {
        try {
            var m = require(mod);
        } catch(err) {
            return options;
        }
        return m.beforeCompile(conf, options);
    }
    return options;
};

/* tasks definition */
module.exports.tasks = {
    'pre-cordova-prepare': [
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons',
        'lib/platforms/shared/actions/build/tasks/copy_splashscreens',
        'lib/platforms/shared/actions/build/tasks/clean'
    ],
    'pre-cordova-compile': [
        'lib/platforms/shared/actions/build/tasks/copy_sounds',
        'lib/platforms/ios/actions/build/tasks/product_file_name',
        'lib/platforms/ios/actions/build/tasks/bundle_id',
        'lib/platforms/ios/actions/build/tasks/set_code_sign_identity',
        'lib/platforms/ios/actions/build/tasks/build_number',
        'lib/platforms/ios/actions/build/tasks/extend_plist',
        'lib/platforms/ios/actions/build/tasks/known_regions'
    ],
    'post-cordova-compile': [
        'lib/platforms/ios/actions/build/tasks/copy_app',
        'lib/platforms/ios/actions/build/tasks/run_xcrun'
    ],
    'undo': [
        'lib/platforms/shared/actions/build/tasks/reset_config_xml',
        'lib/platforms/ios/actions/build/tasks/undo_set_code_sign_identity'
    ]
};
