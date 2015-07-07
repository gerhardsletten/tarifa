var Q = require('q'),
    path = require('path'),
    format = require('util').format,
    fs = require('fs'),
    exec = require('child_process').exec,
    cordova_lazy_load = require('cordova-lib/src/cordova/lazy_load');

function requirements(libPath) {
    var cmd = path.join(libPath, 'bin', 'check_reqs');

    if(!fs.existsSync(cmd)) return Q.resolve();

    var defer = Q.defer(),
        options = {
            timeout: 0,
            maxBuffer: 1024 * 500
        },
        msg = [],
        child = exec(cmd, options);

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
            defer.reject(format('%s error code: %s %s', cmd, code, msg.join()));
        } else {
            defer.resolve();
        }
    });

    return defer.promise;
}

module.exports = function (platform) {
    return cordova_lazy_load.cordova(platform).then(requirements);
};
