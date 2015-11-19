var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    format = require('util').format,
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations.ios[msg.configuration],
        cordovaConf = msg.localSettings.cordova,
        buildDefault = cordovaConf.build && cordovaConf.build.ios || {},
        build = conf.build || buildDefault,
        keys = Object.keys(build),
        xcconfigPath = path.join(pathHelper.app(), 'platforms/ios/cordova/build.xcconfig'),
        xcconfigContent = fs.readFileSync(xcconfigPath, 'utf-8').split('\n');

    if(keys.length) {
        keys.forEach(function (key) {
            var reg = new RegExp('^ *' + key + ' *= *.*$'),
                replaced = false;
            xcconfigContent.forEach(function (line, idx) {
                if(reg.test(line)) {
                    replaced = true;
                    xcconfigContent[idx] = format('%s = %s', key, build[key]);
                }
            });
            if(!replaced) {
                xcconfigContent.push(format('%s = %s', key, build[key]));
            }
        });
        fs.writeFileSync(xcconfigPath, xcconfigContent.join('\n'));
        log.send('success', '[ios] extends build.xcconfig');
    }
    return Q.resolve(msg);
};
