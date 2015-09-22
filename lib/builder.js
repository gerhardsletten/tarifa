var Q = require('q'),
    fs = require('q-io/fs'),
    chalk = require('chalk'),
    npm = require('npm'),
    path = require('path'),
    settings = require('./settings'),
    log = require('./helper/log');

var execNpmInstall = function (wwwPath) {
    var d = Q.defer();

    npm.load(function (loadErr) {
        if(loadErr) {
            d.reject(loadErr);
            return;
        }
        npm.commands.install(wwwPath, [], function (installErr) {
            if(installErr) {
                log.send(
                    'error',
                    'npm install error in %s, reason:\n%s%s',
                    wwwPath,
                    installErr,
                    'You may have a problem with your network connectivity.'
                );
                d.reject(installErr);
                return;
            }

            npm.on('log', function (msg) {
                log.send('message', msg);
            });
            d.resolve();
        });
    });
    return d.promise;
};

module.exports.init = function (root) {
    var wwwPath = path.join(root, settings.webAppPath),
        nodeModulesPath = path.join(wwwPath, 'node_modules');
    return fs.exists(nodeModulesPath).then(function (exists) {
        return exists ? Q.resolve() : execNpmInstall(wwwPath);
    });
};

module.exports.build = function (root, platform, localSettings, configuration) {
    var wwwBuild = require(path.join(root, settings.build)).build;
    if (typeof wwwBuild !== 'function')
        return Q.reject('www project build failed! `project/bin/build.js` must expose a `build` function');
    return wwwBuild(platform, localSettings, configuration).then(function () {
        log.send(
            'success',
            'www project build done with configuration %s',
            configuration
        );
    }, function (err) {
        log.send(
            'error',
            'www project build failed! %s',
            chalk.underline('check your project/bin/build.js script')
        );
        return Q.reject(err);
    });
};

module.exports.watch = function (root, ƒ, localSettings, platform, configuration, confEmitter) {
    var builder = require(path.join(root, settings.build));
    builder.watch(ƒ, localSettings, platform, configuration, confEmitter);
    return builder.close;
};

module.exports.checkWatcher = function checkWatch(root) {
    var builder = require(path.join(root, settings.build));
    if(!builder.watch || typeof builder.watch !== 'function')
        return Q.reject('www project build script does not export a `watch` function.');
    if(!builder.close || typeof builder.close !== 'function')
        return Q.reject('www project build script does not export a `close` function.');
    return Q.resolve();
};

module.exports.test = function (root, platform, localSettings, config, caps, serverConfig) {
    return require(path.join(root, settings.build)).test(platform, localSettings, config, caps, serverConfig);
};
