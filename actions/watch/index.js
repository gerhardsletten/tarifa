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
    log = require('../../lib/helper/log'),
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

function watch(platform, config, httpPort, norun) {
    if (!feature.isAvailable('watch', platform)) {
        return Q.reject(format('feature not available on %s!', platform));
    }

    return Q.all([
        tarifaFile.parse(pathHelper.root(), platform, config),
        isAvailableOnHost(platform)
    ]).spread(run(platform, config, httpPort, norun))
      .spread(wait)
      .spread(closeWatchers);
}

function closeWatchers(tarifaFileWatch, tarifaPrivateWatch, closeBuilderWatch) {
    return sigint(function () {
        log.send('success', 'closing www builder');
        tarifaFileWatch.close();
        tarifaPrivateWatch.close();
        closeBuilderWatch();
    });
}

function run(platform, config, httpPort, norun) {
    return function (localSettings) {
        return Q.all([
            askHostIp(),
            findPorts(settings.livereload_port, settings.livereload_range, 1),
            findPorts(httpPort, 1, 1),
            builder.checkWatcher(pathHelper.root())
        ]).spread(function (ip, lrPorts, httpPorts) {
            return startLiveReloadServer(lrPorts[0]).then(function () {
                return startHttpServer(lrPorts[0], httpPorts[0], platform);
            }).then(function () {
                var msg = {
                    localSettings: localSettings,
                    platform : platform,
                    configuration: config,
                    watch: format('http://%s:%s/index.html', ip, httpPorts[0])
                };
                return norun ? Q(msg) : runAction.runƒ(msg);
            }).then(function (msg) {
                log.send('success', 'watch %s at %s', platform, chalk.green.underline(msg.watch));
                return [localSettings, platform, config, ip, lrPorts[0], httpPorts[0]];
            });
        });
    };
}

function onWatcherError(filePath) {
    return function (err) {
        log.send('error', err);
        log.send('error', 'error watching %s', filePath);
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
        var t = (new Date()).getTime();
        log.send('info', '\n\t%s', chalk.green(cool()));
        log.send('info', chalk.magenta('\ndone in ~ %ds\n'), Math.floor((t-t0)/1000));
    };
}

function trigger(localSettings, platform, config, ip, httpPort, lrPort) {
    return function (filePath) {
        var t0 = (new Date()).getTime();
        log.send('success', 'www project triggering tarifa');

        var www = pathHelper.cordova_www(),
            out = localSettings.project_output;

        return prepare(www, out, localSettings, platform, config).then(function () {
            return onchange(ip, httpPort, lrPort, out, filePath).then(logTime(t0));
        });
    };
}

function wait(localSettings, platform, config, ip, lrPort, httpPort) {
    var root = pathHelper.root(),
        tarifaFilePath = path.join(root, settings.publicTarifaFileName),
        tarifaPrivatePath = path.join(root, settings.privateTarifaFileName);

    return Q.all([
        watchFile(tarifaFilePath), watchFile(tarifaPrivatePath)
    ]).spread(function (tarifaFileWatch, tarifaPrivateWatch) {

        tarifaFileWatch.on('error', onWatcherError(tarifaFilePath));
        tarifaPrivateWatch.on('error', onWatcherError(tarifaPrivatePath));

        var confEmitter = new EventEmitter();
        var closeBuilderWatch = builder.watch(
                pathHelper.root(),
                trigger(localSettings, platform, config, ip, httpPort, lrPort),
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

        return [ tarifaFileWatch, tarifaPrivateWatch, closeBuilderWatch ];
    });
}

var action = function (argv) {
    var norun = false,
        httpPort = settings.default_http_port;

    if (argsHelper.matchArgumentsCount(argv, [1, 2]) &&
            argsHelper.checkValidOptions(argv, ['p', 'port', 'norun'])) {

        if (argsHelper.matchOptionWithValue(argv, 'p', 'port')) {
            httpPort = parseInt(argv.p || argv.port, 10);
            if (isNaN(httpPort)) {
                log.send('error', 'httpPort `%s` is not valid', argv.port === true ? '' : argv.port);
                return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
            }
        }

        norun = argsHelper.matchOptionWithValue(argv, 'norun');
        return watch(argv._[0], argv._[1] || 'default', httpPort, norun);
    }

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

module.exports = action;
