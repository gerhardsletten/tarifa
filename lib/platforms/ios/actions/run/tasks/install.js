var Q = require('q'),
    chalk = require('chalk'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    spawn = require('child_process').spawn,
    format = require('util').format,
    path = require('path');

var install = function (conf, device) {
    var defer = Q.defer(),
        configs = conf.localSettings.configurations,
        product_name = configs['ios'][conf.configuration].product_name,
        app_path = path.join(pathHelper.app(), 'platforms/ios', product_name + '.app'),
        bin = path.join(__dirname, '../../../../../../', 'node_modules', 'ios-deploy', 'ios-deploy'),
        argFormat = conf.log ? '-i %s -b %s -d -I --verbose' : '-L -I -i %s -b %s --verbose',
        args = format(argFormat, device, app_path).split(' ');

    log.send('success', 'start ios app install %s to device %s', product_name, device);
    if (conf.log) clearInterval(conf.spinner);

    var child = spawn(bin, args);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('close', function(code) {
        log.send('success', 'killed `ios-deploy`');
        if (code > 0) defer.reject(format('ios-deploy %s failed with code %s', args.join(' '), code));
        else defer.resolve(conf);
    });

    function killIosDeploy() {
        child.kill();
        Q.delay(2000).then(child.kill);
    }

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) { killIosDeploy(); }
    });

    process.on('SIGINT', killIosDeploy);

    return defer.promise;
};

module.exports = function (conf) {
    if(conf.device) {
        return install(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (p, device) {
            return Q.when(p, function (c) {
                return install(c, device);
            });
        }, conf);
    }
};
