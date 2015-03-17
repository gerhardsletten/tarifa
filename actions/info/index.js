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
    devices = require('../../lib/devices'),
    settings = require('../../lib/settings'),
    print = require('../../lib/helper/print'),
    tarifaFile = require('../../lib/tarifa-file'),
    pkg = require('../../package.json');

function getToolVersion(name, tool, verbose) {
    var defer = Q.defer(),
        options = {
            timeout : 10000,
            maxBuffer: 1024 * 400
        },
        child = exec(tool, options, function (err, stdout, stderr) {
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

function check_tools(verbose) {
    return function (platforms) {
        var rslts = [],
            ok = true,
            bins = settings.external;

        for(var bin in bins) {
            if(bins[bin]['print_version']
                && bins[bin].os_platforms.indexOf(os.platform()) > -1) {
                rslts.push(getToolVersion(
                            bins[bin]['name'],
                            bins[bin]['print_version'],
                            verbose)
                        );
            }
        }

        return Q.allSettled(rslts).then(function (results) {
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    print(
                        "%s %s %s",
                        chalk.green(result.value.name),
                        chalk.green('version:'),
                        result.value.version
                    );
                } else {
                    ok = false;
                    print(chalk.cyan('%s not found!'), result.reason.split(' ')[0]);
                    if (verbose) print('\tReason: %s', chalk.cyan(result.reason));
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

function check_cordova(platforms, verbose) {
    var cordovaLibPaths = platforms.map(function (platform) {
            return cordova_lazy_load.cordova(platform).then(function (libPath) {
                return {
                    name: platform,
                    path: libPath
                };
            });
        });

    return Q.all(cordovaLibPaths).then(function (libs) {
        libs.forEach(function (lib) {
            print("%s %s", chalk.green(format("cordova %s lib path:", lib.name)), lib.path);
        });
    }, function (err) {
        print.error("Could not check cordova lib. Use --verbose for details");
        if (verbose) print.trace(err);
    });
}

function check_cordova_platform_version(verbose) {
    return function (platforms) {
        return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
            return getCordovaPlatformsVersion(
                path.join(pathHelper.root(), settings.cordovaAppPath),
                localSettings.platforms.map(platformHelper.getName).filter(platformsLib.isAvailableOnHostSync)
            ).then(function (versions) {
                versions.forEach(function (v) {
                    print("%s %s", chalk.green(format("current project version %s:", v.name)), v.version);
                });
            });
        }, function (err) {
            if(verbose) print.warning(err);
            print.warning("Not in a tarifa project, can't output installed platform versions");
        }).then(function () {
            return platforms;
        });
    };
}

function check_requirements(verbose) {
    return function () {
        return platformsLib.listAvailableOnHost(verbose).then(function (platforms) {
            if (platforms.length)
                print("%s %s", chalk.green("installed platforms on host:"), platforms.join(', '));
            else
                print("no platform installed!");
            return platforms;
        });
    };
}

function printDevices(platforms, verbose) {
    return platforms.reduce(function (p, device) {
        return p.then(function () {
            return devices[device] ? devices[device].print(verbose) : Q();
        });
    }, Q());
}

function info(verbose) {
    print("%s %s", chalk.green('node version:'), process.versions.node);
    print("%s %s", chalk.green('cordova-lib version:'), pkg.dependencies['cordova-lib']);

    var platforms = listAvailablePlatforms();

    return check_cordova(platforms, verbose)
        .then(check_requirements(verbose))
        .then(check_cordova_platform_version(verbose))
        .then(check_tools(verbose))
        .then(function (msg) {
            if(!msg.noerrors) print.warning("not all needed tools are available!");
            return printDevices(msg.platforms, verbose);
        });
}

function dump_configuration() {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        print("%s\n%s",
            chalk.green('tarifa configuration after the parsing:'),
            JSON.stringify(localSettings, null, 2)
        );
    });
}

module.exports = function (argv) {
    var verbose = false,
        helpPath = path.join(__dirname, 'usage.txt'),
        hasNoArgs = argsHelper.matchArgumentsCount(argv, [0]),
        hasValidDumpOpt = argsHelper.checkValidOptions(argv, ['V', 'verbose', 'dump-configuration']);

    if(hasNoArgs && hasValidDumpOpt) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }
        if (argsHelper.matchOption(argv, null, 'dump-configuration')) {
            return dump_configuration();
        } else {
            return info(verbose);
        }
    }
    return fs.read(helpPath).then(print);
};

module.exports.info = info;
