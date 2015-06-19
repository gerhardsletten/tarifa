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

var cpuInfo = function (device) {
    var defer = Q.defer(),
        cmd = format("%s -s %s shell cat /proc/cpuinfo", settings.external.adb.name, device.id);

    exec(cmd, function (error, stdout, stderr) {
        if (error !== null) { defer.reject(error); }
        else {
            try {
                var out = stdout.toString(),
                    proc = out.match(/Processor(.*)/)[0].split(':')[1].trim(),
                    archi = out.match(/CPU architecture(.*)/)[0].split(':')[1].trim(),
                    hardware = out.match(/Hardware(.*)/)[0].split(':')[1].trim();
                device.cpu = proc;
                device.cpu_hardware = hardware;
                device.cpu_architecture = archi;
            } catch(err) {
                defer.reject(err);
            }
            defer.resolve(device);
        }
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
            return Q.all(rslts.filter(function (rslt) { return rslt.state === 'fulfilled'; })
                .map(function (rslt) { return rslt.value; })
                .map(cpuInfo));
        });
    });
};

module.exports = {
    list: list,
    isSupported: true
};
