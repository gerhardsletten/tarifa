var Q = require('q'),
    ncp = require('ncp').ncp,
    path = require('path'),
    rimraf = require('rimraf'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path');

module.exports = function (msg) {
    var conf = conf = msg.localSettings.configurations.ios[msg.configuration],
        appPath = path.join(pathHelper.app(), 'platforms/ios/build/device', conf['product_name'] + '.app'),
        toPath = path.join(pathHelper.app(), 'platforms/ios', conf['product_name'] + '.app'),
        removeDefer = Q.defer(),
        copyDefer = Q.defer();

    rimraf(toPath, function (err) {
        if(err) removeDefer.reject(err);
        else removeDefer.resolve();
    });

    return removeDefer.promise.then(function () {
        var d = Q.defer();
        ncp.limit = 16;
        ncp(appPath, toPath, function (err) {
            if (err) return copyDefer.reject(err);
            if(msg.verbose)
                print.success('copy .app from %s to %s', appPath, toPath);
            copyDefer.resolve(msg);
        });
        return copyDefer.promise;
    });
};
