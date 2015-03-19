var Q = require('q'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    exec = require('child_process').exec,
    format = require('util').format,
    path = require('path');

var install = function (conf, device) {
    var defer = Q.defer(),
        configs = conf.localSettings.configurations,
        product_name = configs['ios'][conf.configuration].product_name,
        app_path = path.join(pathHelper.app(), 'platforms/ios', product_name + '.app'),
        bin = path.join(__dirname, '../../../../../../', 'node_modules', 'ios-deploy', 'ios-deploy'),
        cmdFormat = conf.debug ? '%s --uninstall -i %s -b "%s" -d -I --verbose' : '%s --uninstall -I -i %s -b "%s" --verbose',
        cmd = format(cmdFormat, bin, device, app_path),
        options = {
            // don't kill the ios-deploy process
            timeout : 0,
            maxBuffer: 1024 * 1000
        };
    if(conf.verbose)
        print.success('start ios app install %s to device %s', product_name, device);

    var child = exec(cmd, options, function (err, stdout, stderr) {
        if(err && err.code !== 253 && !err.killed) {
            if(conf.verbose) {
                print.error('command: %s', cmd);
                print.error('ios-deploy stderr %s', stderr);
            }
            defer.reject('ios-deploy ' + err);
            return;
        }
        defer.resolve(conf);
    });

    if (conf.verbose || conf.debug) child.stdout.pipe(process.stdout);
    if (conf.debug) clearInterval(conf.spinner);

    function killIosDeploy(child, defer) {
        Q.delay(2000).then(function () {
            child.kill();
            print();
            if(conf.verbose) print.success('kill ios-deploy');
        });
    }

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) {
            killIosDeploy(child, defer);
        }
    });

    process.stdin.setRawMode();

    process.on('SIGINT', function() { killIosDeploy(child, defer); });

    return defer.promise;
};

module.exports = function (conf) {
    if(conf.device) {
        return install(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (promise, device) {
            return promise.then(function (c) { return install(c, device); });
        }, Q.resolve(conf));
    }
};
