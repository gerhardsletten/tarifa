var Q = require('q'),
    child_process = require('child_process'),
    format = require('util').format,
    log = require('../../../../../helper/log'),
    inferClasName = require('../../../lib/infer-classname'),
    settings = require('../../../../../settings');

var logcat = function (defer, conf, device) {
    clearInterval(conf.spinner);

    var child = child_process.spawn(
        settings.external.adb.name,
        ['-s', device, 'logcat']
    );

    child.stdout.on('data', function (d) {
        log.send('msg', d.toString().replace(/\n/g, ''));
    });
    child.stderr.on('data', function (e) {
        log.send('error', e.toString());
    });

    child.on('close', function(code) {
        log.send('success', 'killed `adb logcat`');
        if (code > 0) defer.reject('adb logcat failed with code ' + code);
        else defer.resolve(conf);
    });

    function killadb() {
        Q.delay(1000).then(child.kill);
    }

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) { killadb(); }
    });

    process.on('SIGINT', killadb);
};

var open = function (conf, device) {
    var defer = Q.defer(),
        confs = conf.localSettings.configurations.android,
        configuration = confs[conf.configuration],
        name = inferClasName(configuration.product_name),
        activity = configuration.id + '.' + name,
        cmd = format(
            '%s -s %s shell am start %s/%s',
            settings.external.adb.name,
            device,
            configuration.id,
            activity
        ),
        options = {
            timeout : 10000,
            maxBuffer: 1024 * 400
        };

    log.send(
        'success',
        'trying to open android app with activity %s on %s',
        activity,
        device
    );

    child_process.exec(cmd, options, function (err, stdout, stderr) {
        if(!! err && stdout) log.send('msg', 'adb output %s', stdout);
        if(err) {
            log.send('error', 'command: %s', cmd);
            log.send('error', 'adb stderr %s', stderr);
            defer.reject('adb ' + err);
        }
        else {
            if(!conf.log) defer.resolve(conf);
            else logcat(defer, conf, device);
        }
    });

    return defer.promise;
}

module.exports = function (conf) {
    if(conf.device) {
        return open(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (p, device) {
            return Q.when(p, function (c) {
                return open(c, device);
            });
        }, conf);
    }
};
