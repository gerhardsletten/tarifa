var path = require('path'),
    fs = require('q-io/fs'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations.wp8[msg.configuration],
        product_file_name = conf['product_file_name'] + '.xap',
        src =  path.resolve(pathHelper.app(), 'platforms', 'wp8', 'Bin', 'Release', product_file_name),
        dest = path.resolve(pathHelper.app(), 'platforms', 'wp8', product_file_name);

    return fs.copy(src, dest).then(function () {
        if(msg.verbose) print.success('copy %s', product_file_name);
        return msg;
    });
};
