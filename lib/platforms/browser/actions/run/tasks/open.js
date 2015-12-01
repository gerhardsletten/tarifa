var Q = require('q'),
    os = require('os'),
    spawn = require('child_process').spawn,
    execSync = require('child_process').exec,
    format = require('util').format,
    path = require('path'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path');

module.exports = function (conf) {
    log.send('success', 'trying to open browser!');
    log.send('msg', '^C to quit');
    var defer = Q.defer(),
        browserLib = path.join(pathHelper.app(), 'platforms', 'browser', 'cordova'),
        cmd = path.join(browserLib, os.platform() === 'win32' ? 'run.bat' : 'run'),
        child = spawn(cmd, [], {
            cwd: pathHelper.app()
        });

    child.stdout.on('data', function (d) {
        log.send('info', d.toString().replace(/\n/g, ''));
    });

    child.on('close', function() {
        log.send('msg', '');
        log.send('success', 'killed `cordova-serve`');
        defer.resolve(conf);
    });

    function killRun() {
        if(os.platform() === 'win32')
            execSync(format('taskkill /PID %s /T /F', child.pid));
        else Q.delay(1000).then(function () {child.kill();});
    }

    process.openStdin().on('keypress', function(chunk, key) {
        if(key && key.name === 'c' && key.ctrl) { killRun(); }
    });

    process.on('SIGINT', killRun);

    if(conf.timeout) {
        var t = parseInt(conf.timeout, 10),
            time = (isNaN(t) ? 30 : t);
        log.send('success', 'will kill `cordova-serve` after %ss', time);
        setTimeout(killRun, time * 1000);
    }

    return defer.promise;
};
