var Q = require('q'),
    path = require('path'),
    os = require('os'),
    fs = require('q-io/fs'),
    EventEmitter = require('events').EventEmitter,
    format = require('util').format,
    chalk = require('chalk'),
    cool = require('cool-ascii-faces'),
    argsHelper = require('../../lib/helper/args'),
    collectionsHelper = require('../../lib/helper/collections'),
    pathHelper = require('../../lib/helper/path'),
    builder = require('../../lib/builder'),
    feature = require('../../lib/feature'),
    print = require('../../lib/helper/print'),
    isAvailableOnHost = require('../../lib/cordova/platforms').isAvailableOnHost,
    runAction = require('../run'),
    tarifaFile = require('../../lib/tarifa-file'),
    settings = require('../../lib/settings'),
    askHostIp = require('./helper/askip'),
    watchFile = require('./helper/watchFile'),
    startLiveReloadServer = require('./helper/reloadServer'),
    startHttpServer = require('./helper/httpServer'),
    prepare = require('./helper/prepare'),
    onchange = require('./helper/onchange'),
    findPorts = require('./helper/findPorts');

function sigint(ƒ) {
    var d = Q.defer();
    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) {
            Q.delay(2000).then(function () {
                ƒ();
                d.resolve();
            });
        }
    });
    process.stdin.setRawMode();
    process.on('SIGINT', function() {
        Q.delay(200).then(function () {
            ƒ();
            d.resolve();
        });
    });
    return d.promise;
}

function watch(platform, config, httpPort, norun, verbose) {
    if (!feature.isAvailable('watch', platform)) {
        return Q.reject(format('feature not available on %s!', platform));
    }

    return Q.all([
        tarifaFile.parse(pathHelper.root(), platform, config),
        isAvailableOnHost(platform)
    ]).spread(run(platform, config, httpPort, norun, verbose))
      .spread(wait)
      .spread(closeWatchers);
}

function closeWatchers(tarifaFileWatch, tarifaPrivateWatch, closeBuilderWatch, verbose) {
    return sigint(function () {
        print();
        if(verbose) print.success('closing www builder');
        tarifaFileWatch.close();
        tarifaPrivateWatch.close();
        closeBuilderWatch();
    });
}

function run(platform, config, httpPort, norun, verbose) {
    return function (localSettings) {
        return Q.all([
            askHostIp(),
            findPorts(settings.livereload_port, settings.livereload_range, 1),
            findPorts(httpPort, 1, 1),
            builder.checkWatcher(pathHelper.root())
        ]).spread(function (ip, lrPorts, httpPorts) {
            return startLiveReloadServer(lrPorts[0], verbose).then(function () {
                return startHttpServer(lrPorts[0], httpPorts[0], platform, verbose);
            }).then(function () {
                var msg = {
                    localSettings: localSettings,
                    platform : platform,
                    configuration: config,
                    watch: format('http://%s:%s/index.html', ip, httpPorts[0]),
                    verbose: verbose
                };
                return norun ? Q(msg) : runAction.runƒ(msg);
            }).then(function (msg) {
                if (verbose) print.success('watch %s at %s', platform, chalk.green.underline(msg.watch));
                return [localSettings, platform, config, ip, lrPorts[0], httpPorts[0], verbose];
            });
        });
    };
}

function onWatcherError(filePath, verbose) {
    return function (err) {
        if (verbose) { print(err); }
        print.error('error watching %s', filePath);
    };
};

function onChange(root, platform, config, currentConf, confEmitter) {
    return function (evt) {
        tarifaFile.parse(root, platform, config).then(function (changedSettings) {
            var changedConf = changedSettings.configurations[platform][config];
            if (!collectionsHelper.objectEqual(currentConf, changedConf)) {
                currentConf = changedConf;
                confEmitter.emit('change', changedConf);
            }
        });
    };
}

function logTime(t0) {
    return function () {
        if(verbose) {
            var t = (new Date()).getTime();
            print('\n\t%s', chalk.green(cool()));
            print(chalk.magenta('\ndone in ~ %ds\n'), Math.floor((t-t0)/1000));
        }
    };
}

function trigger(localSettings, platform, config, ip, httpPort, lrPort, verbose) {
    return function (filePath) {
        var t0 = (new Date()).getTime();
        if(verbose) print.success('www project triggering tarifa');

        var www = pathHelper.cordova_www(),
            out = localSettings.project_output;

        return prepare(www, out, localSettings, platform, config, verbose).then(function () {
            return onchange(ip, httpPort, lrPort, out, filePath, verbose).then(logTime(t0));
        });
    };
}

function wait(localSettings, platform, config, ip, lrPort, httpPort, verbose) {
    var root = pathHelper.root(),
        tarifaFilePath = path.join(root, settings.publicTarifaFileName),
        tarifaPrivatePath = path.join(root, settings.privateTarifaFileName);

    return Q.all([
        watchFile(tarifaFilePath, verbose), watchFile(tarifaPrivatePath, verbose)
    ]).spread(function (tarifaFileWatch, tarifaPrivateWatch) {

        tarifaFileWatch.on('error', onWatcherError(tarifaFilePath, verbose));
        tarifaPrivateWatch.on('error', onWatcherError(tarifaPrivatePath, verbose));

        var confEmitter = new EventEmitter();
        var closeBuilderWatch = builder.watch(
                pathHelper.root(),
                trigger(localSettings, platform, config, ip, httpPort, lrPort, verbose),
                localSettings,
                platform,
                config,
                confEmitter
            );

        setTimeout(function () {
            var currentConf = localSettings.configurations[platform][config];
            tarifaFileWatch.on('change', onChange(root, platform, config, currentConf, confEmitter));
            tarifaPrivateWatch.on('change', onChange(root, platform, config, currentConf, confEmitter));
        }, 1000);

        return [ tarifaFileWatch, tarifaPrivateWatch, closeBuilderWatch, verbose ];
    });
}

var action = function (argv) {
    var verbose = false,
        norun = false,
        httpPort = settings.default_http_port,
        helpPath = path.join(__dirname, 'usage.txt');

    if (argsHelper.matchArgumentsCount(argv, [1, 2]) &&
            argsHelper.checkValidOptions(argv, ['V', 'verbose', 'p', 'port', 'norun'])) {
        if (argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }

        if (argsHelper.matchOptionWithValue(argv, 'p', 'port')) {
            httpPort = parseInt(argv.p || argv.port, 10);
            if (isNaN(httpPort)) {
                print.error('httpPort `%s` is not valid', argv.port === true ? '' : argv.port);
                return fs.read(helpPath).then(print);
            }
        }

        norun = argsHelper.matchOptionWithValue(argv, 'norun');
        return watch(argv._[0], argv._[1] || 'default', httpPort, norun, verbose);
    }

    return fs.read(helpPath).then(print);
};

module.exports = action;
