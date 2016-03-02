var Q = require('q'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    spawn = require('child_process').spawn,
    format = require('util').format,
    sim = require('ios-sim'),
    path = require('path');

var install = function (conf, device) {
    var defer = Q.defer(),
        configs = conf.localSettings.configurations,
        product_name = configs.ios[conf.configuration].product_name,
        signed = configs.ios[conf.configuration].sign !== undefined,
        app_path = path.join(pathHelper.app(), 'platforms/ios', product_name + '.app'),
        iosDeploy = path.join('node_modules', 'ios-deploy', 'build', 'Release', 'ios-deploy'),
        npm2Path = path.join(__dirname, '../../../../../../', iosDeploy),
        npm3Path = path.join(__dirname, '../../../../../../../../', iosDeploy),
        bin = pathHelper.isFile(npm2Path) ? npm2Path : npm3Path;
        args = ['-i', device, '-b', app_path, '--verbose', '--no-wifi'];

    if(device.match(/Simulator/)) {
        log.send('success', 'Try during 20s to launch ios app %s on Simulator %s', product_name, device.split(':')[1].trim());
        sim.launch(app_path, device.split(':')[1].trim(), false, false);
        Q.delay(20000).then(defer.resolve);
        return defer.promise;
    }

    if (!signed) {
        args.push('-I');
        if (conf.log) args.push('-d');
        else args.push('-L');
    }

    log.send('success', 'start ios app install %s to device %s', product_name, device);

    var child = spawn(bin, args);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('close', function(code) {
        log.send('success', 'killed `ios-deploy`');
        if (code > 0) {
            defer.reject(format('ios-deploy %s failed with code %s', args.join(' '), code));
        } else {
            if (signed) log.send('warning', 'Can\'t launch or debug a signed application');
            defer.resolve(conf);
        }
    });

    function killIosDeploy() {
        child.kill();
        Q.delay(2000).then(child.kill);
    }

    process.openStdin().on('keypress', function(chunk, key) {
        if(key && key.name === 'c' && key.ctrl) { killIosDeploy(); }
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
