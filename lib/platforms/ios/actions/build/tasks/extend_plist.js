var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    plist = require('plist'),
    pathHelper = require('../../../../../helper/path'),
    collectionsHelper = require('../../../../../helper/collections'),
    print = require('../../../../../helper/print');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        iosSettings = cordova.settings && cordova.settings.ios;

    if(!iosSettings) return Q.resolve(msg);

    var name = msg.localSettings.name,
        plistFileName = name + '-Info.plist',
        plistPath = path.join(pathHelper.app(), 'platforms', 'ios', name, plistFileName),
        plistObj = plist.parse(fs.readFileSync(plistPath, 'utf-8')),
        newPlistObj = collectionsHelper.mergeObject(plistObj, iosSettings, true);

    fs.writeFileSync(plistPath, plist.build(newPlistObj).toString());

    if(msg.verbose) print.success('extending project plist');
    return Q.resolve(msg);
};
