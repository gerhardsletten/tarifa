var path = require('path'),
    fs = require('q-io/fs'),
    format = require('util').format,
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

function copy (device) {
    // FIXME copy and rename the folder
    return function (msg) {
        var conf = msg.localSettings.configurations.windows[msg.configuration],
            product_file_name = format('%s-%s.appx', conf.product_file_name, device),
            plt = path.resolve(pathHelper.platforms(), 'windows'),
            version = (conf.version || msg.localSettings.version) + '.0',
            fileFormat = 'CordovaApp.%s_%s_anycpu%sTest\\CordovaApp.%s_%s_anycpu%s.appx',
            file = format(
                fileFormat,
                device,
                version,
                conf.release ? '_' : '_debug_',
                device,
                version,
                conf.release ? '' : '_debug'
            ),
            src = path.resolve(plt, 'AppPackages', file),
            dest = path.resolve(plt, product_file_name);

        return fs.copy(src, dest).then(function () {
            log.send('success', '[windows] copy %s for %s', product_file_name, device);
            return msg;
        });
    };
};

module.exports = function (msg) {
    return copy('Windows')(msg).then(copy('Phone'));
};
