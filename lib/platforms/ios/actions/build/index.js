module.exports.beforeCompile = function (conf, options) {
    options.push('--device');
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
