var Q = require('q'),
    exec = require('child_process').exec,
    format = require('util').format,
    settings = require('./settings');

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

var isAndroid = function (device) {
    var defer = Q.defer(),
        cmd = format("%s -s %s shell ls /system/b2g/b2g", settings.external.adb.name, device.id);

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

var list = function () {
    var defer = Q.defer();
    exec(settings.external.adb.name + " devices -l", function (error, stdout, stderr) {
        if (error !== null) defer.reject(error);
        else defer.resolve(parse(stdout.toString()));
    });
    return defer.promise.then(function (devices) {
        return Q.allSettled(devices.map(isAndroid)).then(function (rslts) {
            return rslts.filter(function (rslt) { return rslt.state === 'fulfilled'; })
                .map(function (rslt) { return rslt.value; });
        });
    });
};

module.exports = {
    list: list,
    isSupported: true
};
