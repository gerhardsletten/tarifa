var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    xcode = require('xcode-fork'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
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
        if(msg.verbose) print.success('product name set to %s', name);
    } catch (err) {
        return Q.reject("pbxproj file parser error: " + err);
    }
    return Q.resolve(msg);
};
