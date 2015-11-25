/* tasks definition */
module.exports.tasks = {
    'pre-cordova-prepare': [
        'lib/platforms/shared/actions/build/tasks/clean',
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons',
        'lib/platforms/shared/actions/build/tasks/copy_splashscreens'
    ],
    'pre-cordova-compile': [

    ],
    'post-cordova-compile': [

    ],
    'undo': [ 'lib/platforms/shared/actions/build/tasks/reset_config_xml' ]
};
