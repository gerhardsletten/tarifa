var Q = require('q'),
    spawn = require('child_process').spawn,
    path = require('path'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path');

module.exports = function (conf) {
    clearInterval(conf.spinner);
    log.send('success', 'trying to open browser!');
    log.send('msg', '^C to quit\n');
    var defer = Q.defer(),
        child = spawn(path.join('platforms', 'browser', 'cordova', 'run'), [], {
            cwd: pathHelper.app()
        });

    child.stdout.on('data', function (d) {
        log.send('info', d.toString().replace(/\n/g, ''));
    });

    child.stderr.on('data', function (e) {
        log.send('error', e.toString());
    });

    child.on('close', function(code) {
        log.send('msg', '');
        log.send('success', 'killed `cordova-serve`');
        if (code > 0) defer.reject('`cordova-serve` failed with code ' + code);
        else defer.resolve(conf);
    });

    function killRun() {
        Q.delay(1000).then(child.kill);
    }

    process.openStdin().on('keypress', function(chunk, key) {
        if(key && key.name === 'c' && key.ctrl) { killRun(); }
    });

    process.on('SIGINT', killRun);

    return defer.promise;
};
