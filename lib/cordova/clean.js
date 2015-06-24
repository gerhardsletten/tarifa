var Q = require('q'),
    path = require('path'),
    chalk = require('chalk'),
    fs = require('fs'),
    exec = require('child_process').exec,
    os = require('os'),
    log = require('../helper/log'),
    settings = require('../settings');

function clean(root, platform) {
    return function () {
        var defer = Q.defer(),
            cwd = path.resolve(root, settings.cordovaAppPath, 'platforms', platform, 'cordova'),
            cmd = 'clean',
            options = {
                cwd: cwd,
                timeout : 0,
                maxBuffer: 1024 * 4000
            };

        if(!fs.existsSync(path.resolve(cwd, cmd))) return Q.resolve();

        cmd = fs.readFileSync(path.resolve(cwd, cmd), 'utf-8').indexOf('#!/bin/bash') > -1 ? './'+cmd : 'node ' + cmd;
        cmd += ' ' + require(path.resolve(__dirname, '../platforms', platform, 'actions/clean')).options.join(' ');

        var child = exec(cmd, options, function (err, stdout, stderr) {
            if(err) {
                log.send('error', 'command: clean');
                log.send('error', 'command stderr %s', stderr);
                defer.reject('command stderr ' + err);
                return;
            }

            log.send('success', 'cleaning platform %s', platform);
            defer.resolve();
        });

        child.stdout.on('data',function (msg) {
            log.send('info', msg.replace(/\n/g, '').toString());
        });

        return defer.promise;
    };
}

module.exports = function (root, platforms) {
    return platforms.reduce(function (p, platform) {
        return Q.when(p, clean(root, platform));
    }, Q.resolve());
};
