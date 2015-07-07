var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    intersection = require('interset/intersection'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    argsHelper = require('../../lib/helper/args'),
    platformHelper = require('../../lib/helper/platform'),
    platformsLib = require('../../lib/cordova/platforms'),
    log = require('../../lib/helper/log'),
    tasks = require('./tasks');

function multiplePlatformsTask(task, platforms, config, argv) {
    var conf = [tarifaFile.parse(pathHelper.root()), platformsLib.listAvailableOnHost()];
    return Q.all(conf).spread(function (settings, availablePlatforms) {
        platforms = intersection(
            availablePlatforms,
            platforms || settings.platforms.map(platformHelper.getName)
        );
        return platforms.reduce(function(promise, platform) {
            return promise.then(function () {
                log.send('outline', 'Run task for %s platform', platform);
                return tarifaFile.parse(pathHelper.root(), platform, config)
                    .then(function (localSettings) {
                        return task({
                            localSettings: localSettings,
                            platform: platform,
                            config: config,
                            argv: argv
                        });
                    });
            });
        }, Q());
    });
}

function runTask(task, platform, config, argv) {
    if (platform === 'all')
        return multiplePlatformsTask(task, null, config, argv);
    else if (argsHelper.matchWildcard(platform))
        return multiplePlatformsTask(task, argsHelper.getFromWildcard(platform), config, argv);
    else
        return multiplePlatformsTask(task, [platform], config, argv);
}

function clean(nbToKeep) {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        return tasks.clean({ localSettings: localSettings }, nbToKeep);
    });
}

var action = function (argv) {
    if(argsHelper.matchCmd(argv._, ['version', 'list', '+', '+']))
        return runTask(tasks.list, argv._[2], argv._[3] || 'default', argv);

    if(argsHelper.matchCmd(argv._, ['version', 'upload', '+', '+']))
        return runTask(tasks.upload, argv._[2], argv._[3] || 'default', argv);

    if(argsHelper.matchCmd(argv._, ['version', 'update', '+', '+']))
        return runTask(tasks.updateLast, argv._[2], argv._[3] || 'default', argv);

    if(argsHelper.matchCmd(argv._, ['version', 'clean', '*']))
        return clean(argv._[2]);

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

module.exports = action;
