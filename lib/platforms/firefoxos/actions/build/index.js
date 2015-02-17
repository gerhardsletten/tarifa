var Q = require('q');

/* bypass compile step */
module.exports.compile = function (conf) {
    return Q.resolve(conf);
};

/* tasks definition */
module.exports.tasks = {
    'clean-resources': [ ],
    'pre-cordova-prepare' : [
        'lib/platforms/shared/actions/build/tasks/populate_config_xml'
    ],
    'pre-cordova-compile' : [ ],
    'post-cordova-compile' : [ ],
    'undo':[
        'lib/platforms/shared/actions/build/tasks/reset_config_xml'
    ]
};
