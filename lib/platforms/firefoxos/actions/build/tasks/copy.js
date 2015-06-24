var Q = require('q'),
    path = require('path'),
    fs = require('q-io/fs'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations.firefoxos[msg.configuration],
        platformsRoot = path.join(pathHelper.app(), 'platforms'),
        src_path = path.join(platformsRoot, 'firefoxos', 'build', 'package.zip'),
        dest_path = pathHelper.productFile('firefoxos', conf['product_file_name']);

    return fs.exists(src_path).then(function (file) {
        return file ? fs.copy(src_path, dest_path) : Q.reject('No package.zip found!');
    }).then(function () {
        log.send('success', '[firefoxos] copy apk from %s to %s', src_path, dest_path);
        return msg;
    });
};
