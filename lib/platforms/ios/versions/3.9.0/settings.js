var fs = require('fs'),
    path = require('path'),
    pathHelper = require('../../../../helper/path'),
    log = require('../../../../helper/log');

module.exports.beforeCompile = function (conf, options) {
    options.push('--nosign');
    var out = path.join(pathHelper.app(), 'platforms', 'ios', 'cordova', 'lib', 'build.js');
    fs.writeFileSync(
        out,
        fs.readFileSync(path.resolve(__dirname, 'cordova-build.js'))
    );
    log.send('success', '[ios] copy custom `%s` to ios platform', out);
    return options;
};
