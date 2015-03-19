var Q = require('q'),
    child_process = require('child_process'),
    print = require('../../../../../helper/print'),
    inferJavaClassNameFromProductName = require('../../../lib/infer-classname'),
    settings = require('../../../../../settings');

var logcat = function (defer, conf) {
    clearInterval(conf.spinner);
    var child = child_process.spawn(settings.external.adb.name, ['logcat']);

    child.stdout.on('data', function (d) { print(d.toString()); });
    child.stderr.on('data', function (e) { print.error(e.toString()); });

    child.on('close', function(code) {
        print();
        if(conf.verbose) print.success('killed `adb logcat`');
        if (code > 0) defer.reject('adb logcat failed with code ' + code);
        else defer.resolve(conf);
    });

    function killadb() {
        Q.delay(1000).then(child.kill);
    }

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) { killadb(); }
    });

    process.stdin.setRawMode();

    process.on('SIGINT', killadb);
}

var open = function (conf, device) {
    var defer = Q.defer();
    var name = inferJavaClassNameFromProductName(conf.localSettings.configurations['android'][conf.configuration].product_name);
    var activity = conf.localSettings.configurations['android'][conf.configuration].id + '.' + name;
    var cmd = settings.external.adb.name
        + ' -s ' + device
        + ' shell am start '
        + conf.localSettings.configurations['android'][conf.configuration].id
        + '/'+ activity;

    var options = {
        timeout : 10000,
        maxBuffer: 1024 * 400
    };

    if(conf.verbose)
        print.success('trying to open android app with activity %s on %s', activity, device);

    child_process.exec(cmd, options, function (err, stdout, stderr) {
        if(conf.verbose && !! err && stdout) print('adb output %s', stdout);
        if(err) {
            if(conf.verbose) {
                print.error('command: %s', cmd);
                print.error('adb stderr %s', stderr);
            }
            defer.reject('adb ' + err);
        }
        else {
            if(!conf.debug) defer.resolve(conf);
            else logcat(defer, conf);
        }
    });

    return defer.promise;
}

module.exports = function (conf) {
    if(conf.device) {
        return open(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (promise, device) {
            return promise.then(function (c) { return open(c, device); });
        }, Q.resolve(conf));
    }
};
