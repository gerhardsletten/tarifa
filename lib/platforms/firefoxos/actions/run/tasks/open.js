var Q = require('q'),
    path = require('path'),
    Configstore = require('configstore'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    confStore = new Configstore('tarifa'),
    fxosCli = require('node-firefoxos-cli');

var open = function(conf, device) {
    var product_file_name = conf.localSettings.configurations['firefoxos'][conf.configuration].product_file_name;

    if (conf.verbose)
        print.success('trying to launch firefoxos app: %s on %s', product_file_name, device);

    return fxosCli.launchApp(product_file_name).then(function () {
        print.success('launched firefoxos app.');
        return conf;
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
