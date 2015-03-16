var Q = require('q'),
    path = require('path'),
    fs = require('q-io/fs'),
    util = require('util'),
    difference = require("interset/difference"),
    collections = require('../helper/collections'),
    pathHelper = require('../helper/path'),
    cordovaPlatforms = require('../cordova/platforms'),
    platformHelper = require('../helper/platform'),
    settings = require('../settings');

function parseResponse(response) {
    var o = {};

    o.name = response.name;
    o.id = response.id;
    o.description = response.description;
    o.version = "0.0.0";
    o.platforms = response.platforms.map(cordovaPlatforms.extendPlatform);
    o.plugins = {};
    o.configurations = {};
    o.cordova = settings.cordova_config;
    o.author = {
        name : response.author_name,
        email : response.author_email,
        href : response.author_href
    };

    if (response.hockeyapp) {
        o.hockeyapp = {
            api_url: 'https://rink.hockeyapp.net/api/2',
            versions_notify: '0',
            versions_status: '1',
            token: response.hockeyapp_token
        };
    }

    o.check = {};
    response.platforms.forEach(function (platform) {
        o.configurations[platform] = rawPlatformConfigObject(platform, o);
        o.check[platform] = util.format("./project/bin/check_%s.js", platform);
        o = require(path.join(__dirname, '../platforms', platform, 'lib/tarifa-file/parseResponse'))(response, o);
    });

    return response.platforms.reduce(function (obj, platform) {
        obj.configurations[platform] = rawPlatformConfigObject(platform, obj);
        obj.check[platform] = util.format("./project/bin/check_%s.js", platform);
        return require(path.join(__dirname, '../platforms', platform, 'lib/tarifa-file/parseResponse'))(response, obj);
    }, o);
}

// what should go in private on tarifa create
var defaultPrivateKeys = ['hockeyapp$token'];

defaultPrivateKeys = settings.platforms.reduce(function (keys, platform) {
    return keys.concat(require(__dirname, '../platforms', platform, 'lib/tarifa-file/privateKeys'));
}, defaultPrivateKeys);

function isPrivateKeyByDefault(key) {
    return defaultPrivateKeys.filter(function (privKey) {
        // key must end with privKey
        return key.indexOf(privKey, key.length - privKey.length) > -1;
    }).length > 0;
}

function isPrivateKey(privateKeys) {
    return function(key) {
        return (privateKeys[key] !== undefined);
    };
}

var tarifaFile = {};

tarifaFile.parse = require('./parse');

function write(dirname, obj) {

    if(obj.project_output === settings.project_output) delete obj.project_output;

    var publicPath = path.join(dirname, settings.publicTarifaFileName),
        privatePath = path.join(dirname, settings.privateTarifaFileName),
        userPrivateKeys = obj['tarifa:userPrivateKeys'] || {},
        oneLvlObj = collections.toOneLevelObject(obj),
        publicObj = collections.toMultiLevelObject(collections.filterKeys(oneLvlObj, function (key) {
            return !isPrivateKey(userPrivateKeys)(key);
        })),
        privateObj = collections.toMultiLevelObject(collections.filterKeys(oneLvlObj, isPrivateKey(userPrivateKeys)));
    return Q.all([
        fs.write(publicPath, JSON.stringify(publicObj, null, 2)),
        fs.write(privatePath, JSON.stringify(privateObj, null, 2))
    ]);
}

/*
 * Create tarifa.json files from tarifa 'create' command response
 */
tarifaFile.createFromResponse = function (response) {
    var config = parseResponse(response);
    oneLevelObj = collections.toOneLevelObject(config);
    privateKeys = collections.filterKeys(oneLevelObj, function (key) {
        return isPrivateKeyByDefault(key);
    });
    var descriptor = {
        configurable: false,
        enumerable: false,
        value: collections.mapValues(privateKeys, function (val) { return true; }),
        writable: false
    };
    Object.defineProperty(config, 'tarifa:userPrivateKeys', descriptor);
    return write(response.path, config).then(function () {
        return response;
    });
};

function rawPlatformConfigObject(platform, obj) {
    var o = {};

    ['default'].concat(settings.configurations).forEach(function (conf) {
        var label = conf == 'default' ? 'init' : conf;
        o[conf] = {
            id : util.format('%s.%s', obj.id, label),
            product_name : util.format('%s_%s', obj.name, label),
            product_file_name : util.format('%s_%s', obj.name.replace(/ /g, '_'), label)
        };

        if(conf === 'prod' || conf === 'stage') o[conf].release = true;
        o = require(path.join(__dirname, '../platforms', platform, 'lib/tarifa-file/rawPlatformConfigObject'))(conf, obj, o);
    });
    return o;
}

tarifaFile.addPlugin = function (dirname, name, uri) {
    return tarifaFile.parse(dirname, null, null, true, true).then(function (obj) {
        if(!obj.plugins) obj.plugins = {};
        obj.plugins[name] = uri;
        return write(dirname, obj).then(function () { return name; });
    });
};

tarifaFile.removePlugin = function (dirname, name) {
    return tarifaFile.parse(dirname, null, null, true, true).then(function (obj) {
        if (obj.plugins[name]) delete obj.plugins[name];
        return write(dirname, obj).then(function () { return name; });
    });
};

tarifaFile.addPlatform = function (dirname, platform) {
    platform = cordovaPlatforms.extendPlatform(platform);
    var platformName = platformHelper.getName(platform);
    return tarifaFile.parse(dirname, null, null, true, true).then(function (obj) {
        if(obj.platforms.map(platformHelper.getName).indexOf(platformName) > -1)
            return Q.reject('Platform already installed!');
        obj.platforms.push(platform);
        if(!obj.configurations) obj.configurations = {};
        if (obj.configurations[platformName] === undefined)
            obj.configurations[platformName] = rawPlatformConfigObject(platformName, obj);
        return write(dirname, obj).then(function () { return obj; });
    });
};

tarifaFile.addPlatforms = function (dirname, platforms) {
    return platforms.reduce(function (p, plt) {
        return Q.when(p, function () {
            return tarifaFile.addPlatform(dirname, plt);
        });
    }, Q());
};

tarifaFile.removePlatform = function (dirname, platform) {
    var plt = platformHelper.getName(platform);
    return tarifaFile.parse(dirname, plt, null, true, true).then(function (obj) {
        obj.platforms = obj.platforms.filter(function (p) {
            return platformHelper.getName(p) !== plt;
        });
        return write(dirname, obj).then(function () { return obj; });
    });
};

tarifaFile.removePlatforms = function (dirname, platforms) {
    return platforms.reduce(function (p, plt) {
        return Q.when(p, function () {
            return tarifaFile.removePlatform(dirname, plt);
        });
    }, Q());
};

tarifaFile.addHockeyappId = function (dirname, platform, config, hockeyappId) {
    return tarifaFile.parse(dirname, platform, config, true, true).then(function (obj) {
        obj.configurations[platform][config].hockeyapp_id = hockeyappId;
        return write(dirname, obj).then(function () { return obj; });
    });
};

tarifaFile.getPlatformConfigs = function (parsedSettings, platformName) {
    return Object.keys(parsedSettings.configurations[platformName]);
};

tarifaFile.checkConfigurations = function (configurations, platformName, parsedSettings) {
    var diff = difference(configurations, Object.keys(parsedSettings.configurations[platformName])),
        l = diff.length;
    if(l) {
        var msg = 'Following configuration%s %s not defined: %s';
        return Q.reject(util.format(msg, l>1 ? 's' : '', l>1 ? 'are' : 'is', diff.join(', ')));
    }
    return Q(configurations);
};

tarifaFile.checkPlatforms = function (platformNames, parsedSettings) {
    var notSupported = difference(platformNames, settings.platforms),
        currentPlatforms = difference(platformNames, notSupported),
        notInstalled,
        notInProject,
        errSupportMsg = 'Platform%s %s not supported: %s',
        errInstallMsg = 'Platform%s %s not available or installed on host: %s',
        errInProjectMsg = 'Platform%s %s not installed in current project: %s',
        errMessage = '',
        platformError = function (msg, platform) {
            var l = platform.length;
            return util.format(msg, l>1 ? 's' : '', l>1 ? 'are' : 'is', platform.join(', '));
        };

    if(notSupported.length)
        errMessage = platformError(errSupportMsg, notSupported);

    return cordovaPlatforms.listAvailableOnHost().then(function (availablePlatforms) {
            notInstalled = difference(currentPlatforms, availablePlatforms);
            currentPlatforms = difference(currentPlatforms, notInstalled);

        if(notInstalled.length){
            errMessage = errMessage.length ? errMessage + '\n' : '';
            errMessage += platformError(errInstallMsg, notInstalled);
        }

        if(parsedSettings) {
            notInProject = difference(currentPlatforms, parsedSettings.platforms.map(platformHelper.getName));
            if(notInProject.length) {
                errMessage = errMessage.length ? errMessage + '\n' : '';
                errMessage += platformError(errInProjectMsg, notInProject);
            }
        }

        if(errMessage.length) return Q.reject(errMessage);
        return platformNames;
    });
};

tarifaFile.write = write;

module.exports = tarifaFile;
