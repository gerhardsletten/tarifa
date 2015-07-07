var path = require('path'),
    Q = require('q'),
    format = require('util').format,
    chalk = require('chalk');

var device = function (desc, platform) {
    return {
        id: desc.udid || desc.name || desc.id,
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

var prettifyDevice = function (platform) {
    return function (adevice) {
        return format(
            chalk.green('%s device with id: %s'),
            chalk.bold(platform),
            chalk.bold.black(adevice.id)
        );
    };
};

var prettifyDeviceWithDescription = function (platform) {
    return function (adevice) {
        var msg = prettifyDevice(platform)(adevice), attr;
        for (attr in adevice.description) {
            msg += format('\n %s: %s', attr, adevice.description[attr]);
        }
        return msg;
    };
};

var prettifyWithDescription = function (platform) {
    return list(platform).then(function (ds) {
        return ds.reduce(function (p, d) {
            return Q.when(p, function (msg) {
                return msg + prettifyDeviceWithDescription(platform)(d);
            });
        }, '');
    });
};

var prettify = function (platform) {
    return list(platform).then(function (ds) {
        return ds.reduce(function (p, d) {
            return Q.when(p, function (msg) {
                return msg + prettifyDevice(platform)(d);
            });
        }, '');
    });
};

var isSupported = function (platform) {
    var mod = path.resolve(__dirname, 'platforms', platform, 'lib/device.js');
    return require(mod).isSupported;
};

module.exports = {
    list: list,
    ids: ids,
    prettify: prettify,
    prettifyWithDescription: prettifyWithDescription,
    isSupported: isSupported
};
