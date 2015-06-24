var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    xcode = require('xcode'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var ios = msg.localSettings.configurations.ios,
        name = ios[msg.configuration]['product_name'] || ios['default']['product_name'],
        xcodeProjFileName = msg.localSettings.name + '.xcodeproj/project.pbxproj',
        pbxprojPath = path.resolve(pathHelper.app(), 'platforms', 'ios', xcodeProjFileName),
        project = xcode.project(pbxprojPath);

    try {
        project.parseSync();
        project.updateProductName(name);
        fs.writeFileSync(pbxprojPath, project.writeSync());
        log.send('success', '[ios] product name set to %s', name);
    } catch (err) {
        return Q.reject("pbxproj file parser error: " + err);
    }
    return Q.resolve(msg);
};
