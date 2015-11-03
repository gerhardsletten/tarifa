var Q = require('q'),
    chalk = require('chalk'),
    fs = require('q-io/fs'),
    os = require('os'),
    path = require('path'),
    format = require('util').format,
    exec = require('child_process').exec,
    cordova_lazy_load = require('cordova-lib/src/cordova/lazy_load'),
    platformsLib = require('../../lib/cordova/platforms'),
    getCordovaPlatformsVersion = require('../../lib/cordova/version').getCordovaPlatformsVersion,
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    platformHelper = require('../../lib/helper/platform'),
    settings = require('../../lib/settings'),
    log = require('../../lib/helper/log'),
    tarifaFile = require('../../lib/tarifa-file'),
    pkg = require('../../package.json');

function getToolVersion(name, tool) {
    var defer = Q.defer(),
        options = {
            timeout: 10000,
            maxBuffer: 1024 * 400
        };
    exec(tool, options, function (err, stdout) {
        if(err) {
            defer.reject(tool + ' ' + err);
            return;
        }
        defer.resolve({
            name: name,
            version: stdout.toString().replace(/\n/g, '')
        });
    });

    return defer.promise;
}

function check_tools() {
    return function (platforms) {
        var rslts = [],
            ok = true,
            bins = settings.external;

        for(var bin in bins) {
            if(bins[bin].print_version
                && bins[bin].os_platforms.indexOf(os.platform()) > -1) {
                rslts.push(getToolVersion(
                            bins[bin].name,
                            bins[bin].print_version)
                        );
            }
        }

        return Q.allSettled(rslts).then(function (results) {
            results.forEach(function (result) {
                if (result.state === 'fulfilled') {
                    log.send(
                        'msg',
                        '%s %s %s',
                        chalk.green(result.value.name),
                        chalk.green('version:'),
                        result.value.version
                    );
                } else {
                    ok = false;
                    log.send('msg', chalk.cyan('%s not found!'), result.reason.split(' ')[0]);
                    log.send('success', '\tReason: %s', chalk.cyan(result.reason));
                }
            });
            return Q.resolve({
                noerrors: ok,
                platforms: platforms
            });
        });
    };
}

function listAvailablePlatforms() {
    var host = os.platform(), r = [];
    for(var p in settings.os_platforms) {
        if(settings.os_platforms[p].indexOf(host) > -1) r.push(p);
    }
    return r;
}

function check_cordova(platforms) {
    var cordovaLibPaths = platforms.reduce(function (promise, platform) {
            return promise.then(function (rslt) {
                var pkg = path.resolve(__dirname, '..', '..', 'lib', 'platforms', platform, 'package.json'),
                    version = require(pkg).version;
                return cordova_lazy_load.cordova_npm({
                    name:platform,
                    packageName: 'cordova-' + platform,
                    version: version
                }).then(function (libPath) {
                    rslt.push({
                        name: platform,
                        path: libPath
                    });
                    return rslt;
                });
            });
        }, Q([]));

    return cordovaLibPaths.then(function (libs) {
        libs.forEach(function (lib) {
            log.send('msg', '%s %s', chalk.green(format('cordova %s lib path:', lib.name)), lib.path);
        });
    }, function (err) {
        log.send('error', 'Could not check cordova lib. Use --verbose for details');
        log.send('error', chalk.red(err.stack || err));
    });
}

function check_cordova_platform_version() {
    return function (platforms) {
        return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
            return getCordovaPlatformsVersion(
                path.join(pathHelper.root(), settings.cordovaAppPath),
                localSettings.platforms.map(platformHelper.getName).filter(platformsLib.isAvailableOnHostSync)
            ).then(function (versions) {
                versions.forEach(function (v) {
                    log.send('msg', '%s %s', chalk.green(format('current project version %s:', v.name)), v.version);
                });
            });
        }, function (err) {
            log.send('info', err);
            log.send('warning', 'Not in a tarifa project, can\'t output installed platform versions');
        }).then(function () {
            return platforms;
        });
    };
}

function check_requirements() {
    return function () {
        return platformsLib.listAvailableOnHost().then(function (platforms) {
            if (platforms.length)
                log.send('msg', '%s %s', chalk.green('installed platforms on host:'), platforms.join(', '));
            else
                log.send('msg', 'no platform installed!');
            return platforms;
        });
    };
}

function info() {
    log.send('msg', '%s %s', chalk.green('node version:'), process.versions.node);
    log.send('msg', '%s %s', chalk.green('cordova-lib version:'), pkg.dependencies['cordova-lib']);

    var platforms = listAvailablePlatforms();

    return check_cordova(platforms)
        .then(check_requirements())
        .then(check_cordova_platform_version())
        .then(check_tools())
        .then(function (msg) {
            if(!msg.noerrors) log.send('warning', 'not all needed tools are available!');
            return msg;
        });
}

function dump_configuration() {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        log.send('msg', '%s\n%s',
            chalk.green('tarifa configuration after the parsing:'),
            JSON.stringify(localSettings, null, 2)
        );
    });
}

module.exports = function (argv) {
    var hasNoArgs = argsHelper.matchArgumentsCount(argv, [0]),
        hasValidDumpOpt = argsHelper.checkValidOptions(argv, ['dump-configuration']);

    if(!hasNoArgs || !hasValidDumpOpt)
        return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);

    var isDump = argsHelper.matchOption(argv, null, 'dump-configuration');

    return isDump ? dump_configuration() : info();
};

module.exports.info = info;
