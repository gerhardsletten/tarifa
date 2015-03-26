var Q = require('q'),
    os = require('os'),
    path = require('path'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    format = require('util').format,
    settings = require('./settings'),
    print = require('../../../helper/print');

var MSG_FXOS_CONNECTED_DEVICES = 'connected firefox devices:';
var ffos_fs_path = '/system/b2g/b2g';

var parse = function(str) {
    return str.replace('List of devices attached', '')
        .replace(/\*.*\*/g, '')
        .split('\n')
        .filter(function (l) { return l.replace('\t', '').trim().length > 0; })
        .map(function (d) {
            return d.split(' ').filter(function (w) {
                return w.length > 0;
            });
        }).filter(function(d) { return d.length > 0; });
};

var isFirefoxOs = function (device) {
    var defer = Q.defer(),
        cmd = format('%s -s %s shell ls %s', settings.external.adb.name, device[0], ffos_fs_path);

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

var all = function () {
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
                defer.resolve(rslt.slice(0,1));
            });
        }
    });

    return defer.promise;
};

var ids = function () {
    return all().then(function (devices) {
        return devices.map(function (device) { return device[0]; });
    });
};

var info = function (verbose) { return verbose ? all() : ids(); };

var show = function (verbose) {
    return info(verbose).then(function (devices) {
        if(!devices.length) {
            print("%s %s", chalk.green(MSG_FXOS_CONNECTED_DEVICES), 'none');
        }
        else if(verbose) {
            print(chalk.green(MSG_FXOS_CONNECTED_DEVICES));
            devices.forEach(function (dev) {
                print('\t%s', dev.join(' '));
            });
        }
        else {
            print(
                "%s\n\t%s",
                chalk.green(MSG_FXOS_CONNECTED_DEVICES),
                devices.join('\n\t')
            );
        }
    });
};

module.exports = {
    info: info,
    print: show
};
