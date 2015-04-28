var Q = require('q'),
    path = require('path'),
    exec = require('child_process').exec,
    format = require('util').format,
    settings = require('./settings');

var MSG_FXOS_CONNECTED_DEVICES = 'connected firefox devices:';
var ffos_fs_path = '/system/b2g/b2g';

var parse = function(str) {
    return str.replace('List of devices attached', '')
        .replace(/\*.*\*/g, '')
        .split(/\n|\r/)
        .filter(function (l) { return l.replace('\t', '').trim().length > 0; })
        .map(function (dev) {
            var ar = dev.split('device ').map(function (s) { return s.trim(); }),
                rslt = { id : ar[0] }, tmp;
            if(!ar[1]) return [];
            ar[1].split(' ').forEach(function (item) {
                tmp =  item.split(':');
                rslt[tmp[0]] = tmp[1];
            });
            return rslt;
        });
};

var isFirefoxOs = function (device) {
    var defer = Q.defer(),
        cmd = format('%s -s %s shell ls %s', settings.external.adb.name, device.id, ffos_fs_path);

    exec(cmd, function (error, stdout, stderr) {
        // build regexp pattern with support for any linefeed ending
        var pattern = new RegExp(format('^%s\\s+$', ffos_fs_path));
        if (error !== null) { defer.reject(error); }
        else {
            if (pattern.test(stdout.toString())) {
                defer.resolve(device);
            } else {
                defer.reject();
            }
        }

    });
    return defer.promise;
};

var list = function () {
    var defer = Q.defer();

    exec(format('%s devices -l', settings.external.adb.name), function (error, stdout, stderr) {
        if (error !== null) { defer.reject(error); }
        else {
            var candidates = parse(stdout.toString());
            Q.allSettled(candidates.map(isFirefoxOs)).then(function (results) {
                var rslt = results.filter(function (result) {
                    return result.state === "fulfilled";
                }).map(function (result) {
                    return result.value;
                });
                defer.resolve(rslt);
            });
        }
    });

    return defer.promise;
};

module.exports = {
    list: list,
    isSupported: true
};
