var print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    fxosCli = require('node-firefoxos-cli');

var install = function (conf, device) {
    var product_file_name = conf.localSettings.configurations['firefoxos'][conf.configuration].product_file_name,
        filename_path = pathHelper.productFile('firefoxos', product_file_name);

    if(conf.verbose)
        print.success('trying to install firefoxos app: %s on %s', product_file_name, device);

    return fxosCli.installPackagedApp(product_file_name, filename_path).then(
        function() {
            print.success('Successfuly installed');
        },
        function(err) {
            print.error('Error updating app: ' + err);
        }
    );
}

module.exports = function (conf) {
    return install(conf);
};
