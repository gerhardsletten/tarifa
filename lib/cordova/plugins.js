var path = require('path'),
    fs = require('fs'),
    cordova = require('cordova-lib').cordova,
    findPlugins = require('cordova-lib/src/cordova/util').findPlugins,
    Q = require('q'),
    Configstore = require('configstore'),
    format = require('util').format,
    _extend = require('util')._extend,
    settings = require('../settings'),
    pathHelper = require('../helper/path'),
    pluginXmlHelper = require('../xml/plugin.xml'),
    difference = require('interset/difference'),
    union = require('interset/union'),
    xml2js = require('xml2js');

function list(root) {
    return Q.resolve(findPlugins(path.join(root, settings.cordovaAppPath, 'plugins')));
}

function getName(root, id) {
    var pkgPath = path.join(root, settings.cordovaAppPath, 'plugins', id, 'package.json');
    if(fs.existsSync(pkgPath)) return require(pkgPath).name;
    else return id;
}

function listAll() {
    var tarifaPlugins = JSON.parse(fs.readFileSync(path.join(__dirname, '../plugins.json'))),
        conf = new Configstore('tarifa'),
        userPlugins = conf.get('plugins');

    if(userPlugins) return tarifaPlugins.concat(userPlugins);
    else return tarifaPlugins;
}

function parseName(name) {
    if(pathHelper.isDirectory(name)) {
        return pluginXmlHelper.getId(path.resolve(name, 'plugin.xml'));
    }
    return Q(name.indexOf('@') > -1 ? name.split('@')[0] : name);
}

function change(cmd, root, val, opts) {
    return list(root).then(function (beforeList) {
        var cordova_path = path.join(root, settings.cordovaAppPath),
            cwd = process.cwd(),
            resolved = fs.existsSync(pathHelper.resolve(val)) ? path.relative(root, pathHelper.resolve(val)) : val,
            rawArg = pathHelper.isDirectory(path.resolve(cwd, resolved)) ? path.resolve(cwd, resolved) : resolved,
            cloneOpts = _extend({}, opts);
        process.chdir(cordova_path);
        return cordova.raw.plugin(cmd, rawArg, cloneOpts).then(function () {
            process.chdir(cwd);
            return list(root).then(function(afterList) {
                var diff = difference(beforeList, afterList);
                if(cmd === 'add') {
                    if (diff.length === 0) return difference(afterList, beforeList);
                    else Q.reject(format('tarifa.json plugins definition contains more plugins than the cordova app!'));
                }
                else {
                    if (diff.length > 0) return diff;
                    else Q.reject(format('cordova app contains more plugins than described in the tarifa.json file!'));
                }
            });
        }).then(function (ids) {
            return Q.all([
                parseName(cloneOpts.plugins[0]),
                Q(ids)
            ]);
        }).spread(function (parsedVal, ids) {
            return [{
                val: parsedVal,
                uri: pathHelper.isDirectory(cloneOpts.plugins[0]) ? cloneOpts.plugins[0] : val,
                variables: opts && opts.cli_variables
            }].concat(ids.filter(function (id) {
                return id !== parsedVal;
            }).map(function (id) {
                return {
                    uri: id,
                    val: id
                };
            }));
        });
    });
}

module.exports.add = function add(root, uri, opts) {
    return change('add', root, uri, opts);
};

module.exports.remove = function remove(root, name) {
    return change('remove', root, name);
};

module.exports.reload = function reload(root, name, uri, opts) {
    return change('remove', root, name).then(function () {
        return change('add', root, uri, opts);
    });
};

module.exports.list = list;
module.exports.getName = getName;
module.exports.listAll = listAll;

module.exports.listAvailable = function () {
    return listAll().filter(function (plugin) { return !plugin.default; });
};
