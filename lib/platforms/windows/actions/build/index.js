/* tasks definition */
module.exports.tasks = {
    'pre-cordova-prepare': [
        'lib/platforms/shared/actions/build/tasks/clean',
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/extend_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons',
        'lib/platforms/shared/actions/build/tasks/copy_splashscreens',
        'lib/platforms/windows/actions/build/tasks/rename'
    ],
    'pre-cordova-compile': [
        'lib/platforms/windows/actions/build/tasks/change_guid',
        'lib/platforms/windows/actions/build/tasks/change_application_content_uri_rules'
    ],
    'post-cordova-compile': [
        'lib/platforms/windows/actions/build/tasks/copy'
    ],
    'undo': [
        'lib/platforms/shared/actions/build/tasks/reset_config_xml',
        'lib/platforms/windows/actions/build/tasks/undo'
    ]
};
