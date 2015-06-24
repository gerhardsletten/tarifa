var Q = require('q'),
    rimraf = require('rimraf'),
    format = require('util').format,
    qfs = require('q-io/fs'),
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    isObject = require('../../lib/helper/collections').isObject,
    argsHelper = require('../../lib/helper/args'),
    tarifaFile = require('../../lib/tarifa-file'),
    settings = require('../../lib/settings'),
    pathHelper = require('../../lib/helper/path'),
    log = require('../../lib/helper/log'),
    platformHelper = require('../../lib/helper/platform'),
    platformsLib = require('../../lib/cordova/platforms'),
    pluginsLib = require('../../lib/cordova/plugins'),
    copyDefaultIcons = require('../../lib/cordova/icon').copyDefault,
    createDefaultAssetsFolders = require('../../lib/cordova/assets').createFolders,
    copyDefaultSplash = require('../../lib/cordova/splashscreen').copyDefault;

function addAssets(platform) {
    var root = pathHelper.root(),
        platformName = platformHelper.getName(platform),
        imagesFolderExistsForPlatform = fs.existsSync(path.resolve(root, settings.images, platformName));

    if (imagesFolderExistsForPlatform) return Q();

    return Q.all(createDefaultAssetsFolders(root, [platformName], 'default'))
        .then(function () { return copyDefaultIcons(root, [platformName]); })
        .then(function () { return copyDefaultSplash(root, [platformName]); });
}

function rmAssets(platform) {
    var defer = Q.defer();
    var platformAssetsPath = path.join(pathHelper.root(), settings.images, platform);
    rimraf(platformAssetsPath, function (err) {
        if(err) log.send('warning', '%s assets folder could not be removed: %s', platform, err);
        else log.send('success', 'removed asset folder');
        defer.resolve();
    });
    return defer.promise;
}

function add(platform, prune) {
    // cordova has a bug that when you install a platform with a plugin
    // with variable already installed, the install will crash
    // so before adding the platform we remove any plugin
    // with variable and we reinstall them after
    var pluginsWithVariables;
    return tarifaFile.addPlatform(pathHelper.root(), platform)
        .then(function (settings) {
            var plugins = settings.plugins;
            var promises = [];
            if (plugins) {
                for (var key in plugins){
                    if (isObject(plugins[key]) && plugins[key].variables !== undefined) {
                        if (pluginsWithVariables === undefined) pluginsWithVariables = {};
                        pluginsWithVariables[key] = plugins[key];
                        log.send('info', 'Removing temporarily plugin: %s', key);
                        promises.push(pluginsLib.remove(pathHelper.root(), key));
                    }
                }
                if (promises.length) return Q.allSettled(promises);
            }
        })
        .then(function () {
            return platformsLib.add(pathHelper.root(), [platform]);
        })
        .then(function () {
            var promises = [];
            if (pluginsWithVariables !== undefined) {
                for (var key in pluginsWithVariables) {
                    var p = pluginsWithVariables[key];
                    log.send('info', 'Reinstalling plugin: %s', key);
                    promises.push(pluginsLib.add(pathHelper.root(), p.uri, {
                        cli_variables: p.variables
                    }));
                }
            }
            if (promises.length) return Q.allSettled(promises);
        })
        .then(function () {
            return addAssets(platform);
        });
}

function remove(platform, prune) {
    return tarifaFile.removePlatform(pathHelper.root(), platform)
        .then(function () { return platformsLib.remove(pathHelper.root(), [platform]); })
        .then(function () {
            if (prune) return rmAssets(platform);
            else return Q();
        });
}

function platformAction (action, platform, prune) {
    var promises = [
        tarifaFile.parse(pathHelper.root()),
        platformsLib.isAvailableOnHost(platformHelper.getName(platform))
    ];

    return Q.all(promises).spread(function (localSettings, available) {
        if(!available)
            return Q.reject(format("Can't %s %s!, %s is not available on your host", action, platform, platform));
        if(action === 'add')
            return add(platformsLib.extendPlatform(platform), prune);
        else
            return remove(platform, prune);
    });
}

function list() {
    return tarifaFile.parse(pathHelper.root()).then(function () {
        return platformsLib.list(pathHelper.root());
    });
}

function info() {
    log.send('outline', 'Supported cordova platforms:\n');
    platformsLib.info().forEach(function (platform) {
        log.send(
            'msg',
            '  %s current version %s\n  supported versions: %s\n',
            platform.name,
            platform.version,
            platform.versions.join(', ')
        );
    });
    return Q();
}

function action (argv) {
    var prune = argsHelper.matchOption(argv, null, 'prune'),
        actions = ['add', 'remove'],
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.checkValidOptions(argv, ['prune'])) {
        if(argv._[0] === 'list' && argsHelper.matchArgumentsCount(argv, [1])){
            return list();
        }
        if(argv._[0] === 'info' && argsHelper.matchArgumentsCount(argv, [1])){
            return info();
        }
        if(actions.indexOf(argv._[0]) > -1 && argsHelper.matchArgumentsCount(argv, [2])) {
            return platformAction(argv._[0], argv._[1], prune);
        }
    }

    return qfs.read(helpPath).then(console.log);
}

action.platform = platformAction;
action.list = list;
module.exports = action;
