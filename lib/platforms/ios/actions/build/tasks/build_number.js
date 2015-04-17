var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    plist = require('plist'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print');

module.exports = function (msg) {
    var build_number = msg.localSettings.configurations.ios[msg.configuration].build_number;
    if (build_number) {
        var name = msg.localSettings.name,
            plistFileName = name + '-Info.plist',
            plistPath = path.join(pathHelper.app(), 'platforms', 'ios', name, plistFileName),
            plistObj = plist.parse(fs.readFileSync(plistPath, 'utf-8'));

        plistObj.CFBundleShortVersionString = build_number;
        fs.writeFileSync(plistPath, plist.build(plistObj).toString());

        if (msg.verbose)
            print.success('set CFBundleShortVersionString to %s', build_number);
    }
    return Q.resolve(msg);
};
