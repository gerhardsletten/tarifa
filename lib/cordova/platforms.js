var path = require('path'),
    os = require('os'),
    fs = require('q-io/fs'),
    Q = require('q'),
    chalk = require('chalk'),
    os = require('os'),
    format = require('util').format,
    cordova_platform_add = require('cordova-lib/src/cordova/platform').add,
    cordova_platform_remove = require('cordova-lib/src/cordova/platform').remove,
    cordova_platform_update = require('cordova-lib/src/cordova/platform').update,
    cordova_util = require('cordova-lib/src/cordova/util'),
    cordova_hooker = require('cordova-lib/src/hooks/HooksRunner'),
    cordova_check = require('./check'),
    version = require('./version'),
    print = require('../helper/print'),
    platformHelper = require('../helper/platform'),
    settings = require('../settings');

function afterPlatformAdd(platforms, root, verbose) {
    return Q.all(platforms.map(version.getPlatformVersion(root))).then(function (usedPlatforms) {
        return usedPlatforms.reduce(function (promise, platform) {
            return promise.then(function () {
                var mod = path.resolve(__dirname, '../platforms', platform.name, 'lib/after_platform_add');
                return require(mod)(platform.version, root, verbose);
            });
        }, Q())
    });
}

function warnPlatformVersion(platforms) {
    platforms.forEach(function(platform) {
        var version = platformHelper.getVersion(platform),
            platformName = platformHelper.getName(platform);
        if(version){
            var versions = require(path.join(__dirname, '../platforms', platformName, 'package.json')).versions;
            if(versions.indexOf(version) < 0){
                print.warning("version %s of platform %s is not supported by tarifa!", version, platformName);
            }
        }
    });
}

function extendPlatform(platform) {
    if(platform.indexOf('@') > -1) {
        return platform;
    } else {
        var pkg = path.join(__dirname, '../platforms', platform, 'package.json');
        return format('%s@%s', platform, require(pkg).version);
    }
}

function addPlatforms (root, platforms, verbose) {
    var cwd = process.cwd(),
        appPath = path.resolve(root, settings.cordovaAppPath);

    platforms = platforms.filter(function (platform) {
        return isAvailableOnHostSync(platformHelper.getName(platform));
    });

    process.chdir(appPath);

    var hooks = new cordova_hooker(appPath),
        opts = {
            platforms: platforms,
            spawnoutput: {
                stdio: 'ignore'
            }
        };

    warnPlatformVersion(platforms);

    return cordova_platform_add(hooks, appPath, platforms, opts).then(function () {
        process.chdir(cwd);
    }).then(function () {
        return afterPlatformAdd(platforms, appPath, verbose);
    }).then(function () {
        if (verbose) {
            platforms.forEach(function (target) {
                print.success('platform %s added', target);
            });
        }
        return platforms;
    });
}

function updatePlatforms (root, platforms, verbose) {
    var cwd = process.cwd(),
        cordovaRoot = path.resolve(root, settings.cordovaAppPath),
        hooks = new cordova_hooker(cordovaRoot),
        opts = {
            platforms: platforms,
            spawnoutput: {
                stdio: 'ignore'
            }
        };

    warnPlatformVersion(platforms);
    process.chdir(cordovaRoot);

    return cordova_platform_update(hooks, cordovaRoot, platforms, opts).then(function () {
        process.chdir(cwd);
    }).then(function () {
        return afterPlatformAdd(platforms, cordovaRoot, verbose);
    }).then(function () { return platforms; });
}

function removePlatforms (root, platforms, verbose) {
    var cwd = process.cwd(),
        appRoot = path.resolve(root, settings.cordovaAppPath);

    process.chdir(appRoot);

    var platformNames = platforms.map(platformHelper.getName),
        hooks = new cordova_hooker(appRoot),
        opts = {
            platforms: platforms,
            spawnoutput: {
                stdio: 'ignore'
            }
        };

    return cordova_platform_remove(hooks, appRoot, platformNames, opts).then(function () {
        process.chdir(cwd);
        if (verbose) {
            platformNames.forEach(function (target) {
                print.success('cordova platform %s removed', target);
            });
        }
        return platforms;
    });
}

function listPlatforms(root, verbose) {
    var cwd = process.cwd(),
        appRoot = path.resolve(root, settings.cordovaAppPath);

    process.chdir(appRoot);

    var platforms_on_fs = cordova_util.listPlatforms(appRoot);

    return Q.resolve(platforms_on_fs).then(function(platforms) {
        if (verbose) {
            print(chalk.green(platforms.join('\n')));
        }
        process.chdir(cwd);
        return platforms;
    });
}

function isAvailableOnHostSync(platform) {
    return settings.os_platforms[platform]
        && settings.os_platforms[platform].indexOf(os.platform()) > -1;
}

function isAvailableOnHost(platform) {
    if(!settings.os_platforms[platform]) return Q.reject("platform name does not exist");
    return isAvailableOnHostSync(platform) ? Q.resolve(true) : Q.reject("platform not available on your os");
}

function installedPlatforms(verbose) {
    var platforms = settings.platforms.filter(isAvailableOnHostSync);
    return platforms.reduce(function (rslt, item) {
        return Q.when(rslt, function (r) {
            return cordova_check(item).then(function () {
                r.push({ name : item, value : item });
                return r;
            }, function (err) {
                if(verbose) print.error("platform %s %s", item, err);
                r.push({ name : item, value : item, disabled: true });
                return r;
            });
        });
    }, []);
}

function listAvailableOnHost(verbose) {
    return installedPlatforms(verbose).then(function (platforms) {
        return platforms.filter(function (p) { return !p.disabled; });
    }).then(function (availables) {
        return availables.map(function (p) { return p.name; });
    });
}

function info() {
    return settings.platforms.map(function (platform) {
        return require(path.resolve(__dirname, '../platforms', platform, 'package.json'));
    });
}

module.exports = {
    add: addPlatforms,
    remove: removePlatforms,
    update : updatePlatforms,
    list: listPlatforms,
    isAvailableOnHost: isAvailableOnHost,
    isAvailableOnHostSync: isAvailableOnHostSync,
    installedPlatforms: installedPlatforms,
    listAvailableOnHost: listAvailableOnHost,
    extendPlatform: extendPlatform,
    info: info
};
