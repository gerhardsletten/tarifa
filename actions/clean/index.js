var Q = require('q'),
    spinner = require("char-spinner"),
    argsHelper = require('../../lib/helper/args'),
    print = require('../../lib/helper/print'),
    tarifaFile = require('../../lib/tarifa-file'),
    isAvailableOnHost = require('../../lib/cordova/platforms').isAvailableOnHost,
    cordovaClean = require('../../lib/cordova/clean'),
    path = require('path'),
    fs = require('fs');

var clean = function (platform, verbose) {
    var tarifaFilePath = path.join(process.cwd(), 'tarifa.json');
    spinner();

    return tarifaFile.parseConfig(tarifaFilePath).then(function (localSettings) {
        if(!isAvailableOnHost(platform)) return Q.reject('platform not available in host!');
        if(platform && localSettings.platforms.indexOf(platform) < 0) return Q.reject('platform not available in project!');
        return cordovaClean(platform ? [platform] : localSettings.platforms, verbose);
    });
};

var action = function (argv) {
    var verbose = false;
    if(argsHelper.matchSingleOption(argv, 'h', 'help')) {
        print(fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf-8'));
        return Q.resolve();
    }

    if(argsHelper.matchSingleOption(argv, 'V', 'verbose')) {
        verbose = true;
    } else if(argv._.length > 1) {
        print(fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf-8'));
        return Q.resolve();
    }

    return clean(argv._[0], verbose);
};

action.clean = clean;
module.exports = action;
