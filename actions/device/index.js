var Q = require('q'),
    fs = require('q-io/fs'),
    os = require('os'),
    path = require('path'),
    argsHelper = require('../../lib/helper/args'),
    devices = require('../../lib/devices'),
    settings = require('../../lib/settings'),
    print = require('../../lib/helper/print');

function listAvailablePlatforms() {
    var host = os.platform(), r = [];
    for(var p in settings.os_platforms) {
        if(settings.os_platforms[p].indexOf(host) > -1) r.push(p);
    }
    return r;
}

function printDevices(platforms, verbose) {
    return platforms.reduce(function (p, platform) {
        return p.then(function () {
            return devices.prettyPrint(platform, verbose);
        });
    }, Q());
}

function device(verbose) {
    return printDevices(listAvailablePlatforms(), verbose);
}

module.exports = function (argv) {
    var verbose = false,
        helpPath = path.join(__dirname, 'usage.txt'),
        hasNoArgs = argsHelper.matchArgumentsCount(argv, [0]),
        hasValidOpt = argsHelper.checkValidOptions(argv, ['V', 'verbose']);

    if(hasNoArgs && hasValidOpt) {
        return device(argsHelper.matchOption(argv, 'V', 'verbose'));
    }
    return fs.read(helpPath).then(print);
};

module.exports.device = device;
