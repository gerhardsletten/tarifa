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
        conf = local.configurations.ios[msg.configuration],
        settings = (conf.cordova && conf.cordova.settings)
            || (cordova.settings && cordova.settings.ios);

    if(!settings) return Q.resolve(msg);

    var name = msg.localSettings.name,
        plistFileName = name + '-Info.plist',
        plistPath = path.join(pathHelper.app(), 'platforms', 'ios', name, plistFileName),
        plistObj = plist.parse(fs.readFileSync(plistPath, 'utf-8')),
        newPlistObj = collectionsHelper.mergeObject(plistObj, settings, true);

    fs.writeFileSync(plistPath, plist.build(newPlistObj).toString());

    if(msg.verbose) print.success('extending project plist');
    return Q.resolve(msg);
};
