var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    settings = require('../../../../../settings');

var install = function (conf, device) {
    var defer = Q.defer(),
        androidConfs = conf.localSettings.configurations.android,
        product_file_name = androidConfs[conf.configuration].product_file_name,
        apk_filename_path = pathHelper.productFile('android', product_file_name),
        cmd = format(
            "%s -s %s install -r \"%s\"",
            settings.external.adb.name,
            device,
            apk_filename_path
        ),
        options = {
            timeout : 100000,
            maxBuffer: 1024 * 400
        };

    log.send(
        'success',
        'trying to install android app: %s on %s',
        product_file_name,
        device
    );

    exec(cmd, options, function (err, stdout, stderr) {
        log.send('msg', 'adb:\n %s %s', stdout, stderr);
        if(err) {
            log.send('error', 'command: %s', cmd);
            log.send('error', 'adb stderr %s', stderr);
            defer.reject('adb command failed; try to plug again the device if the error persist.');
        }
        else {
            defer.resolve(conf);
        }
    });

    return defer.promise;
}

module.exports = function (conf) {
    if(conf.device) return install(conf, conf.device.value);

    return conf.devices.reduce(function (p, device) {
        return Q.when(p, function (c) {
            return install(c, device);
        });
    }, conf);
};
