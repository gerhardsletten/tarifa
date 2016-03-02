var path = require('path'),
    fs = require('fs'),
    pathHelper = require('../../../../helper/path'),
    log = require('../../../../helper/log');

module.exports.beforeCompile = function (conf, options) {
    options.device = conf.device ? !conf.device.value.match(/Simulator/) : true;
    options.noSign = true;
    var out = path.join(pathHelper.app(), 'platforms/ios', conf.localSettings.name, 'Images.xcassets/AppIcon.appiconset/Contents.json');
    fs.writeFileSync(
        out,
        fs.readFileSync(path.resolve(__dirname, 'Contents.json'))
    );
    log.send('success', '[ios] copy custom `%s` to ios platform', out);
    return options;
};
