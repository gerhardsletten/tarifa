var Q = require('q'),
    path = require('path'),
    Configstore = require('configstore'),
    child_process = require('child_process'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    settings = require('../../../lib/settings'),
    confStore = new Configstore('tarifa'),
    fxosCli = require('node-firefoxos-cli');

var logcat = function (defer, conf, device) {
    clearInterval(conf.spinner);

    var child = child_process.spawn(settings.external.adb.name, ['-s', device, 'logcat']);

    child.stdout.on('data', function (d) { print(d.toString().replace(/\n/g, '')); });
    child.stderr.on('data', function (e) { print.error(e.toString()); });

    child.on('close', function(code) {
        if(conf.verbose) print.success('killed `adb logcat`');
        if (code > 0) defer.reject('adb logcat failed with code ' + code);
        else defer.resolve(conf);
    });

    function killadb() {
        Q.delay(200).then(child.kill);
    }

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) { killadb(); }
    });

    process.on('SIGINT', killadb);
};

var open = function(conf, device) {
    var product_name = conf.localSettings.configurations['firefoxos'][conf.configuration].product_name;

    if (conf.verbose)
        print.success('trying to launch firefoxos app: %s on %s', product_name, device);

    return fxosCli.launchApp(product_name).then(function () {

        print.success('launched firefoxos app %s', product_name);
        if(!conf.debug) return conf;

        var d = Q.defer();
        logcat(d, conf, device);
        return d.promise;
    });
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
