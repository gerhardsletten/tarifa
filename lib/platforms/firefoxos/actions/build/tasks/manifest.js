var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    settings = require('../../../../../settings'),
    assets = require('../../../lib/assets');

function update(name, icons) {
    return function (manifest) {
        manifest.name = name;
        manifest.icons = manifest.icons || {};
        var size;
        icons.forEach(function (icon) {
            size = /\d+/.exec(icon.src)[0];
            manifest.icons[size] = icon.dest.replace(/^www/, '');
        });
        return manifest;
    }
}

module.exports = function (msg) {
    var confs = msg.localSettings.configurations.firefoxos,
        app_name = confs[msg.configuration]['product_name'],
        manifestPath = path.join(pathHelper.app(), 'platforms', 'firefoxos', 'www', 'manifest.webapp');

    return fs.read(manifestPath)
        .then(JSON.parse)
        .then(update(app_name, assets.icons))
        .then(function (c) { return JSON.stringify(c, null, 2); })
        .then(function (c) { return fs.write(manifestPath, c); })
        .then(function () {
            if(msg.verbose)
                print.success('change product name to %s', app_name);
            return msg;
        });
};
