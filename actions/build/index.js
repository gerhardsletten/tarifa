var Q = require('q'),
    path = require('path'),
    fs = require('q-io/fs'),
    cordova = require('cordova-lib/src/cordova/cordova'),
    argsHelper = require('../../lib/helper/args'),
    log = require('../../lib/helper/log'),
    pathHelper = require('../../lib/helper/path'),
    platformHelper = require('../../lib/helper/platform'),
    settings = require('../../lib/settings'),
    tarifaFile = require('../../lib/tarifa-file'),
    prepareAction = require('../prepare'),
    platformsLib = require('../../lib/cordova/platforms'),
    getPlatformVersion = require('../../lib/cordova/version').getPlatformVersion,
    argsHelper = require('../../lib/helper/args'),
    tasksHelper = require('../../lib/helper/tasks'),
    tasks = {};

settings.platforms.forEach(function (p) {
    tasks[p] = require(path.join('../../lib/platforms', p, 'actions/build'));
});

var prepare = function (conf) {
    var cwd = process.cwd();
    process.chdir(pathHelper.app());
    log.send('success', 'start cordova prepare');

    return cordova.raw.prepare({
        platforms: [ conf.platform ],
        options: []
    }).then(function (){
        process.chdir(cwd);
        return conf;
    }, function (err){
        process.chdir(cwd);
        return Q.reject(err);
    });
};

var compile = function (conf) {
    var cwd = process.cwd(),
        options = conf.localSettings.mode ? [ conf.localSettings.mode ] : [],
        beforeCompile = tasks[conf.platform].beforeCompile;

    log.send('success', 'start cordova build');
    process.chdir(pathHelper.app());

    options = beforeCompile ? beforeCompile(conf, options) : options;

    return cordova.raw.compile({
        platforms: [ conf.platform ],
        options: options
    }).then(function (){
        process.chdir(cwd);
        return conf;
    }, function (err){
        process.chdir(cwd);
        return Q.reject(err);
    });
};

var runTasks = function (type) {
    return tasksHelper.execTaskSequence(tasks, 'tasks', type);
};

var buildƒ = function (conf){
    var confObj = conf.localSettings.configurations[conf.platform][conf.configuration],
        cwd = process.cwd();

    conf.localSettings.mode = confObj.release ? '--release' : null;

    log.send('success', 'start to build the www project');

    process.chdir(pathHelper.root());
    return getPlatformVersion(pathHelper.app())(conf.platform)
        .then(function (platformInfo) {
            conf.platformVersion = platformInfo.version;
            return conf;
        })
        .then(prepareAction.prepareƒ)
        .then(runTasks('pre-cordova-prepare'))
        .then(prepare)
        .then(runTasks('pre-cordova-compile'))
        .then(tasks[conf.platform].compile || compile)
        .then(runTasks('post-cordova-compile'))
        .then(function () {
            process.chdir(cwd);
            if (conf.keepFileChanges) return Q.resolve(conf);
            else return runTasks('undo')(conf);
        }, function (err) {
            process.chdir(cwd);
            log.send('error', 'build action chain failed, start undo tasks...');
            return runTasks('undo')(conf).then(function () {
                return Q.reject(err);
            });
        });
};

var buildMultipleConfs = function(platform, configs, localSettings, keepFileChanges) {
    var message = {
        platform: platform,
        localSettings: localSettings,
        keepFileChanges: keepFileChanges
    };

    configs = configs || tarifaFile.getPlatformConfigs(localSettings, platform);

    return tarifaFile.checkConfigurations(configs, platform, localSettings).then(function () {
        return configs.reduce(function(msg, conf) {
            return Q.when(msg, function (m) {
                log.send('outline', 'Launch build for %s platform and configuration %s !', platform, conf);
                m.configuration = conf;
                return m;
            }).then(buildƒ);
        }, message);
    });
};

var buildMultiplePlatforms = function (platforms, config, keepFileChanges) {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        platforms = (platforms || localSettings.platforms.map(platformHelper.getName));
        return tarifaFile.checkPlatforms(platforms, localSettings).then(function (availablePlatforms) {
            return availablePlatforms.filter(platformsLib.isAvailableOnHostSync).reduce(function(promise, platform) {
                return promise.then(function () {
                    if (config === 'all') {
                        config = null;
                    } else if (argsHelper.matchWildcard(config)) {
                        config = argsHelper.getFromWildcard(config);
                    }
                    return buildMultipleConfs(platform, config, localSettings, keepFileChanges);
                });
            }, Q());
        });
    });
};

var action = function (argv) {
    var keepFileChanges = argsHelper.matchOption(argv, null, 'keep-file-changes');

    if (argsHelper.matchCmd(argv._, ['__all__', '*']))
        return buildMultiplePlatforms(null, argv._[1] || 'default', keepFileChanges);

    if (argsHelper.matchCmd(argv._, ['__some__', '*'])) {
        return buildMultiplePlatforms(
            argsHelper.getFromWildcard(argv._[0]),
            argv._[1] || 'default',
            keepFileChanges
        );
    }

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

action.buildMultiplePlatforms = buildMultiplePlatforms;
action.buildƒ = buildƒ;
action.prepare = prepare;
module.exports = action;
