var Q = require('q'),
    os = require('os'),
    path = require('path'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    format = require('util').format,
    settings = require('./settings'),
    print = require('../../../helper/print');

var parse = function(str) {
    return str.replace('List of devices attached', '')
        .replace(/\*.*\*/g, '')
        .split(/\n|\r/)
        .filter(function (l) { return l.replace('\t', '').trim().length > 0; })
        .map(function (d) {
            return d.split(/ |\t/).filter(function (w) {
                return w.length > 0;
            });
        })
        .filter(function(d) { return d.length > 0; });
};

var isAndroid = function (device) {
    var defer = Q.defer(),
        cmd = format("%s -s %s shell ls /system/b2g/b2g", settings.external.adb.name, device[0]);

    exec(cmd, function (error, stdout, stderr) {
        // filter firefoxos devices
        var pattern = new RegExp('^/system/b2g/b2g\\s+$');
        if (error !== null) { defer.reject(error); }
        else if (!pattern.test(stdout.toString())) {
            defer.resolve(device);
        } else { defer.reject(); }
    });
    return defer.promise;
};

var all = function () {
    var defer = Q.defer();
    exec(settings.external.adb.name + " devices -l", function (error, stdout, stderr) {
        if (error !== null) defer.reject(error);
        else defer.resolve(parse(stdout.toString()));
    });
    return defer.promise.then(function (devices) {
        return Q.allSettled(devices.map(isAndroid)).then(function (results) {
            return results.filter(function (result) { return result.state === 'fulfilled'; })
                .map(function (result) { return result.value; });
        });
    });
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
            print("%s %s", chalk.green('connected android devices:'), 'none');
        }
        else if(verbose) {
            print(chalk.green('connected android devices:'));
            devices.forEach(function (dev) {
                print('\t%s', dev.join(' '));
            });
        }
        else {
            print(
                "%s\n\t%s",
                chalk.green('connected Android devices:'),
                devices.join('\n\t')
            );
        }
    });
};

module.exports = {
    info: info,
    print: show
};
