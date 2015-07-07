var Q = require('q'),
    rimraf = require('rimraf'),
    spinner = require('char-spinner'),
    path = require('path'),
    fs = require('q-io/fs'),
    intersection = require('interset/intersection'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    platformHelper = require('../../lib/helper/platform'),
    tasksHelper = require('../../lib/helper/tasks'),
    log = require('../../lib/helper/log'),
    tarifaFile = require('../../lib/tarifa-file'),
    listAvailableOnHost = require('../../lib/cordova/platforms').listAvailableOnHost,
    cordovaClean = require('../../lib/cordova/clean'),
    settings = require('../../lib/settings'),
    platformTasks = tasksHelper.load(settings.platforms, 'clean', 'tasks');

var tryRemoveWWW = function () {
    var defer = Q.defer(),
        www = path.join(pathHelper.app(), 'www');

    rimraf(www, function (err) {
        if(err) {
            log.send('warning', err);
            log.send('warning', 'not able to remove www folder in cordova app!');
        }
        fs.makeDirectory(www).then(function() { defer.resolve(); });
    });
    return defer.promise;
};

var runTasks = function (platforms, localSettings) {
    return function () {
        return platforms.reduce(function (msg, platform) {
            return Q.when(msg, tasksHelper.execSequence(platformTasks[platform].map(require)));
        }, {
            settings: localSettings
        });
    };
};

var clean = function (platform) {
    var cwd = process.cwd(),
        conf = [tarifaFile.parse(pathHelper.root()), listAvailableOnHost()];

    spinner();

    return Q.all(conf).spread(function (localSettings, platforms) {
        var usablePlatforms = intersection(
            platforms,
            platform ? [platform] : localSettings.platforms.map(platformHelper.getName)
        );

        process.chdir(pathHelper.root());

        if(platform && usablePlatforms.indexOf(platform) < 0)
            return Q.reject('platform not available on host!');
        if(platform && localSettings.platforms.map(platformHelper.getName).indexOf(platform) < 0)
            return Q.reject('platform not defined in project!');

        return tryRemoveWWW().then(function () {
            return cordovaClean(pathHelper.root(), usablePlatforms);
        }).then(runTasks(usablePlatforms, localSettings));

    }).then(function (msg) {
        process.chdir(cwd);
        return msg;
    }, function (err) {
        process.chdir(cwd);
        throw err;
    });
};

var action = function (argv) {

    if(argsHelper.matchArgumentsCount(argv, [0, 1])) {
        return clean(argv._[0]);
    }
    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

action.clean = clean;
module.exports = action;
