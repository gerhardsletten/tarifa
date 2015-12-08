var Q = require('q'),
    path = require('path'),
    ncp = require('ncp').ncp,
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var defer = Q.defer(),
        conf = msg.localSettings.configurations.windows[msg.configuration],
        plt = path.resolve(pathHelper.platforms(), 'windows'),
        src = path.resolve(plt, 'AppPackages'),
        dest = path.resolve(plt, conf.product_file_name);

    ncp(src, dest, function (err) {
        if (err) return defer.reject(err);
        log.send('success', '[windows] copy package folder to %s ', conf.product_file_name);
        defer.resolve(msg);
    });

    return defer.promise;
};
