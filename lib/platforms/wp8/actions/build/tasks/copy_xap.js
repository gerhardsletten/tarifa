var path = require('path'),
    fs = require('q-io/fs'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations.wp8[msg.configuration],
        product_file_name = conf['product_file_name'] + '.xap',
        mode = conf.release ? 'Release' : 'Debug',
        src =  path.resolve(pathHelper.app(), 'platforms', 'wp8', 'Bin', mode, product_file_name),
        dest = path.resolve(pathHelper.app(), 'platforms', 'wp8', product_file_name);

    return fs.copy(src, dest).then(function () {
        log.send('success', '[wp8] copy %s', product_file_name);
        return msg;
    });
};
