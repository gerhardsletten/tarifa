var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    argsHelper = require('../../lib/helper/args'),
    devices = require('../../lib/devices'),
    platforms = require('../../lib/cordova/platforms'),
    log = require('../../lib/helper/log');

function device(withDescription) {
    var meth = withDescription ? 'prettifyWithDescription' : 'prettify',
        currentPlatforms = platforms.listShouldBeAvailableOnHost();
    return currentPlatforms.reduce(function (p, platform) {
        return Q.when(p, function () {
            return devices[meth](platform);
        }).then(function (msg) { if(msg) log.send('msg', msg); });
    }, Q());
}

module.exports = function (argv) {
    var hasNoArgs = argsHelper.matchArgumentsCount(argv, [0]),
        verbose = argsHelper.matchOption(argv, 'V', 'verbose'),
        helpOpt = argsHelper.matchSingleOption(argv, 'h', 'help');

    if(hasNoArgs && !helpOpt) return device(verbose);

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

module.exports.device = device;
