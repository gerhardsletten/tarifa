var Q = require('q'),
    fxosCli = require('node-firefoxos-cli'),
    chalk = require('chalk'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path');

var install = function (conf, device) {
    var config = conf.localSettings.configurations['firefoxos'][conf.configuration],
        product_file_name = config.product_file_name,
        product_name = config.product_name,
        filename_path = pathHelper.productFile('firefoxos', product_file_name);

    if(conf.verbose)
        print.success('trying to install firefoxos app: %s on %s', product_name, device);

    print.warning(chalk.red('/!\\ Be sure to have only one firefox os device connected'));
    print.warning(chalk.red('/!\\ and no android devices!'));

    return fxosCli.installPackagedApp(product_name, filename_path).then(function () {
      return conf;
    });
}

module.exports = function (conf) {
    if(conf.device) {
        return install(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (promise, device) {
            return promise.then(function (c) { return install(c, device); });
        }, Q.resolve(conf));
    }
};
