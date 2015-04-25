var Q = require('q'),
    os = require('os'),
    chalk = require('chalk'),
    exec = require('child_process').exec,
    print = require('../../../helper/print');

var connectedDevices = function () {
    if (os.platform() !== 'darwin') return Q.resolve([]);
    var defer = Q.defer(),
        cmd = "system_profiler SPUSBDataType | sed -n -e '/iPad/,/Serial/p' -e '/iPhone/,/Serial/p' | grep \"Serial Number:\" | awk -F \": \" '{print $2}'";
    exec(cmd,
        function (error, stdout, stderr) {
            if (error !== null) {
                defer.reject(error);
            }
            else {
                defer.resolve(stdout.split('\n').filter(function(d) {return d.length > 0; }));
            }
    });
    return defer.promise;
};

var info = function (verbose) {
    if (os.platform() !== 'darwin') return Q.resolve([]);
    var defer = Q.defer(),
        filterUdid = function (d) { return d.udid; };
    return connectedDevices().then(function (devices) {
        require('node-ios-device').devices(function (err, devicesInfos) {
            if(err) { defer.reject(err); }
            else {
                var rslt = devicesInfos.filter(function (di) {
                    return devices.indexOf(di.udid) > -1;
                });
                defer.resolve(verbose ? rslt : rslt.map(filterUdid));
            }
        });
        return defer.promise;
    });
};

var printDevice = function (device) {
    print('\tname: %s', device.name);
    print('\t\tudid: %s', device.udid);
    print('\t\tproductType: %s', device.productType);
    print('\t\tproductVersion: %s', device.productVersion);
    print('\t\tbuildVersion: %s', device.buildVersion);
    print('\t\tcpuArchitecture: %s', device.cpuArchitecture);
    print('\t\tdeviceClass: %s', device.deviceClass);
    print('\t\thardwareModel: %s', device.hardwareModel);
    print('\t\tmodelNumber: %s', device.modelNumber);
    print('\t\tserialNumber: %s', device.serialNumber);
    print();
};

var show = function (verbose) {
    return info(verbose).then(function (devices) {
        if(devices.length) {
            print('%s', chalk.green('connected iOS devices:'));
            if (verbose) devices.forEach(printDevice);
            else print("\t%s", devices.join('\n\t'));
        } else {
            print('%s %s', chalk.green('connected iOS devices:'), 'none');
        }
    });
};

module.exports = {
    info: info,
    print: show
};
