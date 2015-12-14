var Q = require('q'),
    path = require('path'),
    format = require('util').format,
    fs = require('fs'),
    exec = require('child_process').exec,
    cordova_lazy_load = require('cordova-lib/src/cordova/lazy_load'),
    pathHelper = require('../helper/path');

function requirements(checkReqsPath) {
    if(!fs.existsSync(checkReqsPath)) return Q.resolve();

    var defer = Q.defer(),
        options = {
            timeout: 0,
            maxBuffer: 1024 * 500
        },
        msg = [],
        child = exec(format('"%s" %s', process.execPath, checkReqsPath), options);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', function (chunk) {
        msg.push(chunk);
    });

    child.stderr.on('data', function (chunk) {
        msg.push(chunk);
    });

    child.on('exit', function (code) {
        if(code > 0) {
            defer.reject(format('%s error code: %s %s', checkReqsPath, code, msg.join()));
        } else {
            defer.resolve();
        }
    });

    return defer.promise;
}

module.exports = function (platform) {
    var pkg = path.resolve(__dirname, '..', '..', 'lib', 'platforms', platform, 'package.json'),
        version = require(pkg).version;
    return cordova_lazy_load.cordova_npm({
        name: platform,
        packageName: 'cordova-' + platform,
        version: version
    }).then(function (libPath) {
        if(platform === 'windows') {
            return path.resolve(pathHelper.platforms(), 'windows', 'cordova', 'check_reqs');
        }
        else {
            return path.join(libPath, 'bin', 'check_reqs');
        }
    }).then(requirements);
};
