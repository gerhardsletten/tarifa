var path = require('path'),
    chalk = require('chalk'),
    print = require('./helper/print');

var device = function (desc, platform) {
    return {
        id : desc.udid || desc.name || desc.id,
        platform: platform,
        description: desc
    };
};

var list = function (platform) {
    var m = path.resolve(__dirname, 'platforms', platform, 'lib/device.js');
    return require(m).list().then(function (ds) {
        return ds.map(function (d) { return device(d, platform); });
    });
};

var ids = function (platform) {
    return list(platform).then(function (ds) {
        return ds.map(function (dev) { return dev.id; });
    });
};

var printDevice = function (platform, verbose) {
    return function (device) {
        print(chalk.green('\n%s device with id: %s'), chalk.bold(platform), chalk.bold.black(device.id));
        if(verbose) {
            for (attr in device.description) {
                print(' %s: %s', attr, device.description[attr])
            }
        }
    };
};

var prettyPrint = function (platform, verbose) {
    return list(platform).then(function (ds) {
        return ds.forEach(printDevice(platform, verbose));
    });
};

var isSupported = function (platform) {
    return require(path.resolve(__dirname, 'platforms', platform, 'lib/device.js')).isSupported;
};

module.exports = {
    list : list,
    ids: ids,
    prettyPrint: prettyPrint,
    isSupported: isSupported
};
