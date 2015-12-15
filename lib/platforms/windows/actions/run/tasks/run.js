var Q = require('q'),
    spawn = require('child_process').spawn,
    path = require('path'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path');

var run = function (conf, device) {
    var defer = Q.defer(),
        release = conf.localSettings.configurations.windows[conf.configuration].release || false,
        windowsLib = path.join(pathHelper.app(), 'platforms', 'windows', 'cordova'),
        cmd = path.join(windowsLib, 'run.bat'),
        defaultOpts = ['--device', '--nobuild'],
        opts = device.value === 'desktop' ? defaultOpts : defaultOpts.concat(['--phone']),
        child = spawn(cmd, release ? opts.concat(['--release']) : opts, {
            cwd: pathHelper.app()
        });

    log.send('success', 'trying to open %s app!', device.value);

    child.stdout.on('data', function (d) {
        log.send('info', d.toString().replace(/\n/g, ''));
    });

    child.on('close', function() {
        log.send('success', 'opening windows app');
        defer.resolve(conf);
    });

    return defer.promise;
};

module.exports = function (conf) {
    if(conf.device) {
        return run(conf, conf.device);
    } else {
        return conf.devices.reduce(function (p, device) {
            return Q.when(p, function (c) {
                return run(c, device);
            });
        }, conf);
    }
};
