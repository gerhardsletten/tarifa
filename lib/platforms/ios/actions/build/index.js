module.exports.beforeCompile = function (conf, options) {
    options.push('--device');
    return options;
};

/* tasks definition */
module.exports.tasks = {
    'clean-resources': [],
    'pre-cordova-prepare' : [
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons',
        'lib/platforms/shared/actions/build/tasks/copy_splashscreens',
        'lib/platforms/shared/actions/build/tasks/clean'
    ],
    'pre-cordova-compile' : [
        'lib/platforms/ios/actions/build/tasks/product_file_name',
        'lib/platforms/ios/actions/build/tasks/bundle_id',
        'lib/platforms/ios/actions/build/tasks/set_code_sign_identity'
    ],
    'post-cordova-compile' : [
        'lib/platforms/ios/actions/build/tasks/run_xcrun',
        'lib/platforms/ios/actions/build/tasks/copy_app'
    ],
    'undo':[
        'lib/platforms/ios/actions/build/tasks/undo_set_code_sign_identity',
        'lib/platforms/shared/actions/build/tasks/reset_config_xml'
    ]
};
