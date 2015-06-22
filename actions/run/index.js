var Q = require('q'),
    spinner = require("char-spinner"),
    child_process = require('child_process'),
    path = require('path'),
    format = require('util').format,
    fs = require('q-io/fs'),
    existsSync = require('fs').existsSync,
    argsHelper = require('../../lib/helper/args'),
    platformHelper = require('../../lib/helper/platform'),
    print = require('../../lib/helper/print'),
    settings = require('../../lib/settings'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    tasksHelper = require('../../lib/helper/tasks'),
    platformsLib = require('../../lib/cordova/platforms'),
    buildAction = require('../build'),
    askDevice = require('./ask_device'),
    argsHelper = require('../../lib/helper/args'),
    askIp = require('../watch/helper/askip'),
    platformTasks = tasksHelper.load(settings.platforms, 'run', 'tasks');

var binaryExists = function (conf) {
    var exists = false, productFileName, productFolder;
    try {
        productFileName = pathHelper.productFile(
            conf.platform,
            conf.localSettings.configurations[conf.platform][conf.configuration].product_file_name
        );
    } catch(err) { }
    if (productFileName && existsSync(productFileName)) exists = true;

    try {
        productFolder = pathHelper.productFolder(
            conf.platform,
            conf.localSettings.configurations[conf.platform][conf.configuration].product_name
        );
    } catch(err) { }
    if (productFolder && existsSync(productFolder)) exists = true;
    return exists;
};

var runƒ = function (conf) {
    var tasks = platformTasks[conf.platform].map(require),
        buildPromise = (function (nobuild) {
            if (nobuild) return Q(conf);
            else return buildAction.buildƒ(conf);
        })(conf.nobuild && binaryExists(conf));

    return buildPromise.then(askDevice).then(tasksHelper.execSequence(tasks));
};

var run = function (platform, config, localSettings, options) {
    print.outline('Launch run for %s platform and configuration %s !', platform, config);
    return runƒ({
        localSettings: localSettings,
        platform: platform,
        configuration: config,
        verbose: options.verbose,
        nobuild: options.nobuild,
        log: options.log,
        all: options.all,
        arch: options.arch,
        spinner: spinner()
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

var startVorlon = function (defer, options) {
    return function (msg) {
        if (!options.debug) return msg;
        return askIp().then(function (ip) {
            var child = child_process.exec(path.resolve(__dirname, '../../node_modules/vorlon/bin', 'vorlon'));
            options.ip = ip;

            child.on('close', function(code) {
                print();
                if (options.verbose) print.success('killed `vorlon`');
                if (code > 0) defer.reject('vorlon failed with code ' + code);
                else defer.resolve(msg);
            });

            function killVorlon() { Q.delay(500).then(child.kill); }

            process.openStdin().on("keypress", function(chunk, key) {
                if(key && key.name === "c" && key.ctrl) { killVorlon(); }
            });

            process.on('SIGINT', killVorlon);
            return msg;
        });
    };
};

var wait = function (defer, options) {
    return function (msg) {
        if (!options.debug) { return msg; }
        else {
            var clientScript = "<script src=\"http://%s:1337/vorlon.js\"></script>",
                script = format(clientScript, options.ip);
            print.warning();
            print.warning("/!\\ You need to add \"%s\" to your index.html", script);
            print.warning();
            print.success("vorlon dashbord: http://%s:1337", options.ip);
            return defer.promise;
        }
    };
};

var runMultiplePlatforms = function (platforms, config, options) {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        if (options.arch && !localSettings.plugins['cordova-plugin-crosswalk-webview'])
            return Q.reject("You are running a specified architecture but you don't have 'cordova-plugin-crosswalk-webview' installed.\nYou should run 'tarifa plugin add cordova-plugin-crosswalk-webview' if you which to use crosswalk.");

        // let's assume the arch is armv7 since it is overwhelmingly majority
        if (!options.arch && localSettings.plugins['cordova-plugin-crosswalk-webview'])
            options.arch = 'armv7';

        var defer = Q.defer(),
            plts = localSettings.platforms.map(platformHelper.getName);
        platforms = platforms || plts.filter(platformsLib.isAvailableOnHostSync);

        return tarifaFile.checkPlatforms(platforms, localSettings)
            .then(startVorlon(defer, options))
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
            })
            .then(wait(defer, options));
    });
};

var action = function (argv) {
    var options = {
            verbose : false,
            nobuild:false,
            log:false,
            all:false,
            debug:false,
            arch: null
        },
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.matchOption(argv, 'V', 'verbose'))
        options.verbose = true;

    if (argsHelper.matchOption(argv, null, 'nobuild'))
        options.nobuild = true;

    if (argsHelper.matchOptionWithValue(argv, null, 'arch'))
        options.arch = argv.arch;

    if (argsHelper.matchOption(argv, null, 'all'))
        options.all = true;

    if (argsHelper.matchOption(argv, 'd', 'debug'))
        options.debug = true;

    if (argsHelper.matchOption(argv, 'l', 'log')) {
        options.log = true;
        if(argsHelper.matchCmd(argv._, ['__multi__', '*']) || argsHelper.matchCmd(argv._, ['*', '__multi__'])) {
            print.error('Oops, not `--log` option on multiple configurations or multiple platforms!');
            print();
            return fs.read(helpPath).then(print);
        }
    }

    if(argsHelper.matchCmd(argv._, ['__all__', '*']))
        return runMultiplePlatforms(null, argv._[1] || 'default', options);

    if (argsHelper.matchCmd(argv._, ['__some__', '*'])) {
        return runMultiplePlatforms(
            argsHelper.getFromWildcard(argv._[0]),
            argv._[1] || 'default',
            options
        );
    }

    return fs.read(helpPath).then(print);
};

action.run = run;
action.runMultiplePlatforms = runMultiplePlatforms;
action.runƒ = runƒ;
module.exports = action;
