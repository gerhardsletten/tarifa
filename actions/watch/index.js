var Q = require('q'),
    path = require('path'),
    os = require('os'),
    fs = require('q-io/fs'),
    restler = require('restler'),
    connect = require("connect"),
    serveStatic = require('serve-static'),
    tinylr = require('tiny-lr-fork'),
    findPort = require('find-port'),
    rimraf = require('rimraf'),
    lr = require('connect-livereload'),
    chokidar = require('chokidar'),
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
    buildAction = require('../build'),
    prepareAction = require('../prepare'),
    tarifaFile = require('../../lib/tarifa-file'),
    settings = require('../../lib/settings'),
    ask = require('../../lib/questions/ask');

function watch(platform, config, httpPort, norun, verbose) {
    if (!feature.isAvailable('watch', platform)) {
        return Q.reject(format('feature not available on %s!', platform));
    }
    return Q.all([
        tarifaFile.parse(pathHelper.root(), platform, config),
        isAvailableOnHost(platform)
    ]).spread(run(platform, config, httpPort, norun, verbose)).spread(wait);
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

function wait(localSettings, platform, config, ip, lrPort, httpPort, verbose) {
    var root = pathHelper.root();
    return watchFile(path.join(root, settings.publicTarifaFileName), verbose).then(function (tarifaFileWatch) {
        tarifaFileWatch.on('error', function (error) {
            if (verbose) { print(error); }
            print.error('error watching %s', filePath);
        });

        var confEmitter = new EventEmitter();
        var closeBuilderWatch = builder.watch(pathHelper.root(), function (file) {
            var t0 = (new Date()).getTime();
            if(verbose) print.success('www project triggering tarifa');

            var www = pathHelper.cordova_www(),
                out = localSettings.project_output,
                copy_method = settings.www_link_method[os.platform()],
                copyPromise = (copy_method === 'copy') ? copyOutput(www, out) : Q.resolve();

            return copyPromise.then(function () {
                return buildAction.prepare({
                    localSettings: localSettings,
                    platform : platform,
                    configuration: config,
                    verbose: verbose
                });
            }).then(function () {
                return onchange(ip, httpPort, lrPort, out, file, verbose);
            }).then(function () {
                if(verbose) {
                    var t = (new Date()).getTime();
                    print('\n\t%s', chalk.green(cool()));
                    print(chalk.magenta('\ndone in ~ %ds\n'), Math.floor((t-t0)/1000));
                }
            });
        }, localSettings, platform, config, confEmitter);

        setTimeout(function () {
            var currentConf = localSettings.configurations[platform][config];
            tarifaFileWatch.on('change', function () {
                tarifaFile.parse(root, platform, config).then(function (changedSettings) {
                    var changedConf = changedSettings.configurations[platform][config];
                    if (!collectionsHelper.objectEqual(currentConf, changedConf)) {
                        currentConf = changedConf;
                        confEmitter.emit('change', changedConf);
                    }
                });
            });
        }, 1000);
        
        return sigint(function () {
            print();
            if(verbose) print.success('closing www builder');
            tarifaFileWatch.close();
            closeBuilderWatch();
        });
    });
}

function askHostIp() {
    var interfaces = os.networkInterfaces(),
        ipv4Filter = function (addr) { return addr.family === 'IPv4'; },
        addrFilter = function (i) { return i.address; },
        concat = function (acc, i) { return acc.concat(i); },
        ips = Object.keys(interfaces).map(function (i) {
            return interfaces[i].filter(ipv4Filter).map(addrFilter);
        }).reduce(concat, []);
    return ask.question('Which ip should be used to serve the configuration?', 'list', ips);
}

function findPorts(from, searchRange, returnCount) {
    var d = Q.defer(),
        to = from + searchRange - 1;
    findPort(from, to, function (ports) {
        if (ports.length >= returnCount) {
            d.resolve(ports.slice(0, returnCount));
        } else {
            d.reject(format('could not find %s in range [%s, %s]', returnCount, from, to));
        }
    });
    return d.promise;
}

function startLiveReloadServer(port, verbose) {
    var d = Q.defer();
    tinylr().listen(port, function (err) {
        if (err) {
            print.error('error while starting live reload server %s', err);
            d.reject();
        } else {
            if (verbose) { print.success('started live reload server on port %s', port); }
            d.resolve();
        }
    });
    return d.promise;
}

function startHttpServer(lrPort, httpPort, platform, verbose) {
    var d = Q.defer(),
        app = connect(),
        index = pathHelper.wwwFinalLocation(pathHelper.root(), platform),
        serve = serveStatic(index, {index: false});
    app.use(lr({port: lrPort}));
    app.use(serve);
    var server = app.listen(httpPort, function () {
        print.success('started web server on port %s for platform %s', httpPort, platform);
        d.resolve();
    });
    server.on('error', function (err) {
        if (verbose) { print(err); }
        d.reject(format('Cannot serve %s on port %s for platform %s', index, httpPort, platform));
    });
    return d.promise;
}

function watchFile(filePath, verbose) {
    var d = Q.defer(),
        w = chokidar.watch(filePath),
        onError = function (error) {
            if (verbose) { print(error); }
            return d.reject(format('cannot watch %s', filePath));
        };
    w.once('ready', function () {
        w.removeListener('error', onError);
        if (verbose) { print.success('watching %s', filePath); }
        d.resolve(w);
    });
    w.once('error', onError);
    return d.promise;
}

function copyOutput(cordova_www, project_output, verbose){
    var defer = Q.defer();
    rimraf(cordova_www, function (err) {
        if(err) return defer.reject(err);
        if(verbose) print.success('rm cordova www folder');
        defer.resolve();
    }, function (err) {
        defer.reject(err);
    });
    return defer.promise.then(function () {
        return prepareAction.copy_method(cordova_www, project_output);
    });
}

function onchange(ip, httpPort, lrPort, project_output, file, verbose) {
    var defer = Q.defer(),
        rewritePath = rewritePathƒ(project_output, ip);
    restler.post(format('http://%s:%s/changed', ip, lrPort), {
        data: JSON.stringify({ files: rewritePath(file, httpPort) })
    }).on('complete', function(data, response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            if(verbose) print.success('live reload updated: %s', rewritePath(file, httpPort));
        } else {
            print.error('can not update live reload %s', response.statusCode);
        }
        defer.resolve();
    });
    return defer.promise;
}

function rewritePathƒ(projectOutput, ip) {
    return function (filePath, httpPort) {
        var srcPath = pathHelper.resolve(projectOutput);
        return filePath.replace(srcPath, format('http://%s:%s', ip, httpPort)).replace(path.sep, '/');
    };
}

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
