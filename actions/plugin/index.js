var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    format = require('util').format,
    argsHelper = require('../../lib/helper/args'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    log = require('../../lib/helper/log'),
    isObject = require('../../lib/helper/collections').isObject,
    pluginXML = require('../../lib/xml/plugin.xml'),
    plugins = require('../../lib/cordova/plugins');

function printPlugins(items) {
    if(items.length === 0) {
        log.send('msg', 'no plugin installed!');
        return Q.resolve();
    }

    return items.reduce(function (msg, p) {
        return Q.when(msg, function () {
            var pluginPath = path.join(pathHelper.app(), 'plugins', p, 'plugin.xml');
            return pluginXML.getVersion(pluginPath).then(function (v) {
                log.send('msg', '%s@%s', plugins.getName(pathHelper.root(), p), v);
            });
        });
    }, {});
}

function logging(f) {
    return function (val) {
        if(val) log.send('info', '%s plugin: %s', f, val);
        else log.send('info', 'no plugin added!');
        return val;
    };
}

var addAction = {
        updateTarifaFile: function (root) {
            return function (def) {
                return tarifaFile.addPlugin(root, def.val, def.uri, def.variables);
            };
        }
    },
    actions = {
        'add': addAction,
        'install': addAction,
        'remove': {
            updateTarifaFile: function (root) {
                return function (def) {
                    return tarifaFile.removePlugin(root, def.val);
                };
            }
        },
        'reload': {
            updateTarifaFile: function () {
                return function () { return true; };
            }
        }
    };

function list() { return plugins.list(pathHelper.root()); }

function validateRemoveAction(f, arg) {
    return function (settings) {
        var act = f === 'remove',
            noPlugin = !settings.plugins || Object.keys(settings.plugins).indexOf(arg) < 0;
        if(act && noPlugin) {
            return Q.reject(format('Can\'t remove uninstalled plugin %s', arg));
        }
        return Q.resolve(settings);
    };
}

function validateAddAction(f, arg) {
    return function (settings) {
        var act = f === 'add' || f === 'install',
            hasPlugin = settings.plugins && Object.keys(settings.plugins).indexOf(arg) > -1;
        if(act && hasPlugin) {
            return Q.reject(format('Can\'t install already installed plugin %s', arg));
        }
        return Q.resolve(settings);
    };
}

function validateReloadAction(f, arg) {
    return function (settings) {
        var act = f === 'reload',
            noPlugin = settings.plugins && Object.keys(settings.plugins).indexOf(arg) < 0;
        if(act && noPlugin) {
            return Q.reject(format('Can\'t reload not installed plugin %s', arg));
        }
        return Q.resolve(settings);
    };
}

function raw_plugin (root, f, arg, variables, link) {
    return tarifaFile.parse(root)
        .then(validateRemoveAction(f, arg))
        .then(validateAddAction(f, arg))
        .then(validateReloadAction(f, arg))
        .then(function (settings) {
            if(f === 'reload') {
                var p = settings.plugins[arg],
                    uri = isObject(p) ? p.uri : p,
                    vars = isObject(p) ? p.variables : {};
                return plugins.reload(root, arg, uri, { cli_variables: vars, link: link })
                    .then(function () { return logging('reload')(arg); });
            } else {
                var opts = { cli_variables: variables };
                if (f === 'add' || f === 'install') { opts.link = link; }
                return plugins[f](root, arg, opts)
                    .then(function (val) {
                        if (!val || !val.val || !val.uri) {
                            return Q.reject('no plugin changed!');
                        }
                        return val;
                    })
                    .then(actions[f].updateTarifaFile(root))
                    .then(logging(f));
            }
        });
}

function plugin(f, arg, variables, link) {
    return raw_plugin(pathHelper.root(), f, arg, variables, link);
}

function getVariableFromCli(v, rst) {
    var kv = v.split('='),
        res = rst || {};
    if (kv.length > 1) res[kv[0]] = kv[1];
    else throw new Error('Wrong variable format');
    return res;
}

function action (argv) {
    var link = false,
        variables = null;

    if(argsHelper.checkValidOptions(argv, ['variable', 'link'])) {
        if(argsHelper.matchOptionWithValue(argv, null, 'variable')) {
            variables = argv.variable;
            if(variables instanceof Array)
                variables = variables.reduce(function(acc, val) {
                    return getVariableFromCli(val, acc);
                }, {});
            else
                variables = getVariableFromCli(variables);
        }
        if (argsHelper.matchOption(argv, null, 'link')) {
            if (['add', 'reload', 'install'].indexOf(argv._[0]) > -1) {
                link = true;
            } else {
                return fs.read(path.join(__dirname, 'usage.txt'))
                    .then(console.log);
            }
        }
        if(argv._[0] === 'list' && argsHelper.matchArgumentsCount(argv, [1])){
            return list().then(printPlugins);
        }
        if(Object.keys(actions).indexOf(argv._[0]) > -1 &&
            argsHelper.matchArgumentsCount(argv, [2])) {
            return plugin(argv._[0], argv._[1], variables, link);
        }
    }

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
}

action.plugin = plugin;
action.list = list;
module.exports = action;
