var Q = require('q'),
    ncp = require('ncp').ncp,
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    settings = require('../../../../../settings'),
    log = require('../../../../../helper/log');

function copySounds(msg) {
    var root = pathHelper.root(),
        src = path.resolve(root, settings.images, msg.platform, msg.configuration, 'sounds');
        platformPath = path.resolve(root, settings.cordovaAppPath, 'platforms'),
        dest = msg.platform === 'ios' ? path.resolve(platformPath, 'ios', 'www')
                : path.resolve(platformPath, 'android', 'res', 'raw');

    if(!pathHelper.isDirectory(src)) return Q(msg);

    var defer = Q.defer();
    ncp(src, dest, function (err) {
        if(err) { defer.reject(err); }
        else {
            log.send('success', 'copied sounds for %s', msg.platform);
            defer.resolve(msg);
        }
    });
    return defer.promise;
}

module.exports = function (msg) {
    switch(msg.platform) {
        case 'android':
        case 'ios':
            return copySounds(msg);
       default:
            return msg;
    }
};
