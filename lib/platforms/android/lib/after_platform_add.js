var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    log = require('../../../helper/log');

module.exports = function (version, cordovaAppRoot) {
    var p = path.resolve(
        __dirname,
        '../versions',
        version,
        'after_platform_add/index.js'
    );
    return fs.exists(p).then(function (exist) {
        if(exist) {
            log.send(
                'success',
                'after_platform_add cordova-android %s',
                version
            );
            return require(p)(cordovaAppRoot);
        }
        else {
            return Q();
        }
    });
};
