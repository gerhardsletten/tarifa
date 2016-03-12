var Q = require('q'),
    spinner = require('char-spinner'),
    path = require('path'),
    fs = require('q-io/fs'),
    existsSync = require('fs').existsSync,
    argsHelper = require('../../lib/helper/args'),
    platformHelper = require('../../lib/helper/platform'),
    log = require('../../lib/helper/log'),
    settings = require('../../lib/settings'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    tasksHelper = require('../../lib/helper/tasks'),
    platformsLib = require('../../lib/cordova/platforms'),
    buildAction = require('../build'),
    askDevice = require('./ask_device'),
    platformTasks = tasksHelper.load(settings.platforms, 'run', 'tasks');

var binaryExists = function (conf) {
    var exists = false,
        configurations = conf.localSettings.configurations[conf.platform],
        c = configurations[conf.configuration],
        productFileName, productFolder;
    if(conf.platform !== 'ios' || conf.platform !== 'windows') {
        productFileName = pathHelper.productFile(conf.platform, c.product_file_name, conf.arch);
        if (productFileName && existsSync(productFileName)) {
            exists = true;
        }
    } else {
        productFolder = pathHelper.productFolder(conf.platform, c.product_name);
        if (productFolder && existsSync(productFolder))
            exists = true;
    }
    return exists;
};

var runƒ = function (conf) {
    var tasks = platformTasks[conf.platform].map(require);
    return askDevice(conf).then(function () {
        return (function (nobuild) {
            if (nobuild) return Q(conf);
            else return buildAction.buildƒ(conf);
        })(conf.nobuild && binaryExists(conf));
    }).then(tasksHelper.execSequence(tasks));
};

var run = function (platform, config, localSettings, options) {
    log.send('outline', 'Launch run for %s platform and configuration %s !', platform, config);
    return runƒ({
        localSettings: localSettings,
        platform: platform,
        configuration: config,
        nobuild: options.nobuild,
        log: options.log,
        all: options.all,
        arch: options.arch,
        device: options.device,
        spinner: spinner(),
        timeout: options.timeout
    });
};

var runMultipleConfs = function(platform, configs, localSettings, options) {
    configs = configs || tarifaFile.getPlatformConfigs(localSettings, platform);
    return tarifaFile.checkConfigurations(configs, platform, localSettings).then(function () {
        return configs.reduce(function(p, conf) {
            return p.then(function () {
                return run(platform, conf, localSettings, options);
            });
        }, Q());
    });
};

var runMultiplePlatforms = function (platforms, config, options) {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        if (options.arch && !localSettings.plugins['cordova-plugin-crosswalk-webview'])
            return Q.reject('You are running a specified architecture but you don\'t have \'cordova-plugin-crosswalk-webview\' installed.\nYou should run \'tarifa plugin add cordova-plugin-crosswalk-webview\' if you which to use crosswalk.');

        // let's assume the arch is armv7 since it is overwhelmingly majority
        if (!options.arch && localSettings.plugins['cordova-plugin-crosswalk-webview'])
            options.arch = 'armv7';

        var plts = localSettings.platforms.map(platformHelper.getName);
        platforms = platforms || plts.filter(platformsLib.isAvailableOnHostSync);

        return tarifaFile.checkPlatforms(platforms, localSettings)
            .then(function (availablePlatforms) {
                return availablePlatforms.reduce(function(promise, platform) {
                    return promise.then(function () {
                        if (config === 'all') {
                            config = null;
                        } else if (argsHelper.matchWildcard(config)) {
                            config = argsHelper.getFromWildcard(config);
                        }
                        return runMultipleConfs(platform, config, localSettings, options);
                    });
                }, Q());
            });
    });
};

var action = function (argv) {
    var helpOpt = argsHelper.matchSingleOption(argv, 'h', 'help'),
        options = {
            nobuild: argsHelper.matchOption(argv, null, 'nobuild'),
            log: argsHelper.matchOption(argv, 'l', 'log'),
            all: argsHelper.matchOption(argv, null, 'all'),
            arch: argsHelper.matchOptionWithValue(argv, null, 'arch') && argv.arch,
            device: argsHelper.matchOptionWithValue(argv, null, 'device') && argv.device,
            timeout: argsHelper.matchOptionWithValue(argv, null, 'timeout') && argv.timeout
        };
    if (!helpOpt && options.log) {
        if(argsHelper.matchCmd(argv._, ['__multi__', '*']) || argsHelper.matchCmd(argv._, ['*', '__multi__'])) {
            log.send('error', 'Oops, not `--log` option on multiple configurations or multiple platforms!');
            return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
        }
    }

    if(!helpOpt && argsHelper.matchCmd(argv._, ['__all__', '*']))
        return runMultiplePlatforms(null, argv._[1] || 'default', options);

    if (!helpOpt && argsHelper.matchCmd(argv._, ['__some__', '*'])) {
        return runMultiplePlatforms(
            argsHelper.getFromWildcard(argv._[0]),
            argv._[1] || 'default',
            options
        );
    }

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

action.run = run;
action.runMultiplePlatforms = runMultiplePlatforms;
action.runƒ = runƒ;
module.exports = action;
