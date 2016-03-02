var Q = require('q'),
    os = require('os'),
    sim = require('ios-sim'),
    exec = require('child_process').exec;

var connectedDevices = function () {
    if (os.platform() !== 'darwin') return Q.resolve([]);
    var defer = Q.defer(),
        cmd = 'system_profiler SPUSBDataType | sed -n -e \'/iPad/,/Serial/p\' -e \'/iPhone/,/Serial/p\' | grep "Serial Number:" | awk -F ": " \'{print $2}\'';
    exec(cmd, function (error, stdout) {
        if (error !== null) {
            defer.reject(error);
        }
        else {
            defer.resolve(stdout.split('\n').filter(function(d) { return d.length > 0; }));
        }
    });
    return defer.promise;
};

var listedDevices = function () {
    try {
        var defer = Q.defer();
        require('node-ios-device').devices(function (err, devicesInfos) {
            if(err) { defer.reject(err); }
            else { defer.resolve(devicesInfos); }
        });
        return defer.promise;
    } catch (err) {
        return connectedDevices().then(function (cds) {
            return cds.map(function (cd) { return { udid: cd }; });
        });
    }
};

var list = function () {
    if (os.platform() !== 'darwin') return Q.resolve([]);
    var simulators = sim.getdevicetypes()
            .filter(function (s) { return !s.match(/Watch|TV/); })
            .map(function (s) { return 'Simulator: ' + s; })
            .map(function (s) { return { udid: s, name: s, id: s }; });
    return Q.all([listedDevices(), connectedDevices()])
        .spread(function (listed, connected) {
            return listed.filter(function (l) {
                return connected.indexOf(l.udid) > -1;
            }).concat(simulators);
    });
};

module.exports = {
    list: list,
    isSupported: true
};
