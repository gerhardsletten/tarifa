var Q = require('q'),
    rimraf = require('rimraf'),
    path = require('path'),
    settings = require('../../../../../settings'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var gradle_build_path = path.join(pathHelper.app(), 'platforms', 'android', 'build'),
        defer = Q.defer();

    rimraf(gradle_build_path, function (err) {
        if(err) defer.reject(err);
        else defer.resolve();
    });

    return defer.promise.then(function () {
        log.send('success', 'clean gradle build');
        return msg;
    });
};
