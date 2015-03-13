var Q = require('q');

/* tasks definition */
module.exports.tasks = {
    'clean-resources': [ ],
    'pre-cordova-prepare' : [
        'lib/platforms/shared/actions/build/tasks/clean',
        'lib/platforms/shared/actions/build/tasks/populate_config_xml',
        'lib/platforms/shared/actions/build/tasks/copy_icons'
    ],
    'pre-cordova-compile' : [ ],
    'post-cordova-compile' : [ ],
    'undo':[
        'lib/platforms/shared/actions/build/tasks/reset_config_xml'
    ]
};
