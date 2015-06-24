var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    plist = require('plist'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var id = msg.localSettings.configurations.ios[msg.configuration]['id'] || msg.localSettings.configurations.ios['default']['id'];
    var name = msg.localSettings.name;
    var plistFileName = name + '-Info.plist';
    var plistPath = path.join(pathHelper.app(), 'platforms', 'ios', name, plistFileName);
    var plistObj = plist.parse(fs.readFileSync(plistPath, 'utf-8'));

    plistObj.CFBundleIdentifier = id;
    fs.writeFileSync(plistPath, plist.build(plistObj).toString());
    log.send('success', '[ios] bundleId set to %s', id);
    return Q.resolve(msg);
};
