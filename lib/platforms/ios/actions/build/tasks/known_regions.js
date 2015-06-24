var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    xcode = require('xcode'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var local = msg.localSettings,
        cordova = local.cordova || {},
        conf = local.configurations.ios[msg.configuration],
        regions = cordova.regions && cordova.regions.ios || ['English'],
        xcodeProjFileName = msg.localSettings.name + '.xcodeproj/project.pbxproj',
        pbxprojPath = path.resolve(pathHelper.app(), 'platforms', 'ios', xcodeProjFileName),
        project = xcode.project(pbxprojPath),
        regions = (conf.cordova && conf.cordova.regions)
            || (cordova.regions && cordova.regions.ios || ['English']);

    try {
        project.parseSync();
        var key = Object.keys(project.hash.project.objects.PBXProject)[0];
        project.hash.project.objects.PBXProject[key].knownRegions = regions;
        fs.writeFileSync(pbxprojPath, project.writeSync());
        log.send('success', '[ios] overwrite known regions to %s', regions.join(', '));
    } catch (err) {
        return Q.reject("pbxproj file parser error: " + err);
    }
    return Q.resolve(msg);
};
