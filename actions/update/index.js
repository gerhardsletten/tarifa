var Q = require('q'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    chalk = require('chalk'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    platformHelper = require('../../lib/helper/platform'),
    tarifaFile = require('../../lib/tarifa-file'),
    cordovaVersion = require('../../lib/cordova/version'),
    cordovaPlatforms = require('../../lib/cordova/platforms'),
    pkg = require('../../package'),
    settings = require('../../lib/settings'),
    intersection = require('interset/intersection'),
    log = require('../../lib/helper/log'),
    plugins = require('../../lib/cordova/plugins'),
    pluginXML = require('../../lib/xml/plugin.xml'),
    pluginAction = require('../plugin').plugin,
    ask = require('../../lib/questions/ask');

function _addInstalledPlatforms(app, msg) {
    msg.installedPlatforms = {};
    return cordovaVersion.getCordovaPlatformsVersion(app, msg.platforms).then(function (plts) {
        plts.forEach(function (p) {
            msg.installedPlatforms[p.name] = p.version;
        });
        return msg;
    });
}

function versionGreater(version1, version2) {
    var v1 = version1.split('.'),
        v2 = version2.split('.');

    function greater(a, b) { return parseInt(a, 10) > parseInt(b, 10); }
    function smaller(a, b) { return parseInt(a, 10) < parseInt(b, 10); }

    for(var i=0, l=v1.length; i<l; i++) {
        if(greater(v1[i], v2[i])) return true;
        if(smaller(v1[i], v2[i])) return false;
    }
    return false;
}

function _addAvailablePlatforms(msg) {
    var latestPlatforms = {},
        platformsInfo = cordovaPlatforms.info();

    platformsInfo.forEach(function (platformInfo) {
        latestPlatforms[platformInfo.name] = platformInfo.version;
    });
    var inter = intersection(
        Object.keys(latestPlatforms),
        Object.keys(msg.installedPlatforms)
    );

    log.send('msg', chalk.underline('platforms to update'));
    msg.platformsToUpdate = [];

    inter.filter(function (p) {
        return !require(path.resolve(__dirname, '../../lib/platforms', p, 'actions/update')).skip;
    }).forEach(function (name) {
        if(versionGreater(latestPlatforms[name], msg.installedPlatforms[name])) {
            msg.platformsToUpdate.push(name);
            log.send(
                'msg',
                '  %s: %s -> %s',
                name,
                msg.installedPlatforms[name],
                latestPlatforms[name]
            );
        }
    });

    if(!msg.platformsToUpdate.length) log.send('msg', '  none');

    return msg;
}

function _addInstalledPlugins(root) {
    return function (msg) {
        return plugins.list(root).then(function (plgs) {
            msg.installedPlugins = plgs;
            return msg;
        });
    };
}

function _pluginVersion(root, p) {
    var pluginPath = path.join(root, settings.cordovaAppPath, 'plugins', p, 'plugin.xml');
    return pluginXML.getVersion(pluginPath);
}

function _addAvailablePlugins(root) {
    return function (msg) {
        var availablePluginsVersions = {},
            availablePlugins = plugins.listAvailable().filter(function (plg) {
                return plg.version;
            }).map(function (plg) {
                availablePluginsVersions[plg.value] = plg.version;
                return plg.value;
            }),
            toUpdate = intersection(availablePlugins, msg.installedPlugins);

        log.send('msg', chalk.underline('default plugins to update'));
        msg.pluginToUpdate = [];
        return toUpdate.reduce(function (promise, p) {
            return promise.then(function () {
                return  _pluginVersion(root, p).then(function (installedVersion) {
                    if(versionGreater(availablePluginsVersions[p], installedVersion)) {
                        msg.pluginToUpdate.push(p);
                        log.send('msg', '  %s %s -> %s', p, installedVersion, availablePluginsVersions[p]);
                    }
                    return Q.resolve();
                });
            });
        }, Q.resolve()).then(function () {
            if(!msg.pluginToUpdate.length) log.send('msg', '  none');
            return msg;
        });
    };
}

function info(root) {
    return function (msg) {
        var appPath = path.join(root, settings.cordovaAppPath);

        log.send('info', 'tarifa version: %s', pkg.version);
        log.send('info', 'current project tarifa version: %s', msg.versionObj.current);
        log.send('info', 'project created with tarifa version: %s\n', msg.versionObj.created);

        return _addInstalledPlatforms(appPath, msg)
            .then(_addAvailablePlatforms)
            .then(_addInstalledPlugins(root))
            .then(_addAvailablePlugins(root));
    };
}

function askUserForUpdate(root) {
    return function (msg) {
        if(!msg.platformsToUpdate.length && !msg.pluginToUpdate.length) {
            log.send('success', 'nothing to update');
            process.exit(0);
        }

        return ask.question('Do you want to update the current project?', 'confirm').then(function (resp) {
            if(resp) return msg;
            else process.exit(0);
        });
    };
}

function runUpdatePlatforms(root) {
    return function (msg) {
        if(!msg.platformsToUpdate.length) return msg;
        var plts = msg.platformsToUpdate.map(cordovaPlatforms.extendPlatform);
        return cordovaPlatforms.remove(root, plts).then(function () {
            return tarifaFile.removePlatforms(root, plts);
        }).then(function () {
            return cordovaPlatforms.add(root, plts);
        }).then(function () {
            return tarifaFile.addPlatforms(root, plts);
        }).then(function () {
            return msg;
        });
    };
}

function runUpdatePlugins(root) {
    return function (msg) {
        var plgs = plugins.listAll();
        return msg.pluginToUpdate.reduce(function (promise, plugin) {
            return promise.then(function () {
                return pluginAction('remove', plugin);
            }).then(function () {
                var idx = plgs.map(function (p) {
                    return p.value;
                }).indexOf(plugin);

                return pluginAction('add', plgs[idx].uri);
            });
        }, Q.resolve())
        .then(function () {
            if(msg.pluginToUpdate.length === 0) return msg;
            log.send('success', 'updated plugins');
            return msg;
        });
    };
}

function getUsablePlatforms(localSettings) {
    return intersection(settings.platforms.filter(function (p) {
        return settings.os_platforms[p].indexOf(os.platform()) > -1;
    }), localSettings.platforms.map(platformHelper.getName));
}

function update() {
    var root = pathHelper.root();

    return tarifaFile.parse(root)
        .then(function (localSettings) {
            return {
                localSettings: localSettings,
                versionObj: JSON.parse(fs.readFileSync(path.join(root, '.tarifa.json'), 'utf-8')),
                platforms: getUsablePlatforms(localSettings),
                pluginToUpdate: [],
                platformsToUpdate : []
            };
        })
        .then(info(root))
        .then(askUserForUpdate(root))
        .then(runUpdatePlatforms(root))
        .then(runUpdatePlugins(root))
        .then(function (msg) {
            fs.writeFileSync(path.join(root, '.tarifa.json'), JSON.stringify({
                current: pkg.version,
                created: msg.versionObj.created
            }));
            if(msg.pluginToUpdate.length || msg.platformsToUpdate.length)
                log.send('success', 'update current project');
        });
}

var action = function (argv) {

    if(argsHelper.matchArgumentsCount(argv, [ 0 ])) return update();

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

action.update = update;
module.exports = action;
