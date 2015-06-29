var Q = require('q'),
    exec = require('child_process').exec,
    format = require('util').format,
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings');

var install = function (conf, deviceIndex) {
    var defer = Q.defer(),
        config = conf.localSettings.configurations.wp8[conf.configuration],
        app_path = path.join(pathHelper.app(), 'platforms','wp8'),
        cmd = format(
            "%s %s -d:%d",
            settings.external.cordovadeploy.name,
            app_path,
            deviceIndex
        ),
        options = {
            timeout : 0,
            maxBuffer: 1024 * 400
        };

    if(config.release || config.sign){
        log.send(
            'warning',
            'Install the xap file manually for configuration %s here: %s!',
            conf.configuration,
            pathHelper.productFile('wp8', config.product_file_name)
        );
        return Q.resolve();
    }

    log.send(
        'success',
        'start wp app install and run to device index %s',
        deviceIndex
    );

    var child = exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            log.send('error', 'command: %s', cmd);
            log.send('error', 'CordovaDeploy.exe stderr %s', stderr);
            defer.reject('CordovaDeploy.exe ' + err);
            return;
        }

        var er = stderr.toString().trim();
        if(er) log.send('warning', ("CordovaDeploy.exe failed with %s", er));
        if(er === 'Error :: 0x89740006')
           log.send('warning', "Too many developer apps installed!");

        defer.resolve(conf);
    });

    child.stdout.on('data',function (msg) {
        log.send('info', msg.replace(/\n/g, '').toString());
    });

    return defer.promise;
};

module.exports = function (conf) {
    if(conf.device) {
        return install(conf, conf.device.index);
    } else {
        return conf.devices.reduce(function (p, device, idx) {
            return Q.when(p, function (c) {
                return install(c, idx);
            });
        }, conf);
    }
};
