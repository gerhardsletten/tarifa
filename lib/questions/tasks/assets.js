/*
 * create assets folders structure
 */

var Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    settings = require('../../settings'),
    log = require('../../helper/log'),
    pathHelper = require('../../helper/path'),
    platformHelper = require('../../helper/platform'),
    copyDefaultIcons = require('../../cordova/icon').copyDefault,
    copyDefaultSplashscreens = require('../../cordova/splashscreen').copyDefault,
    generateDefaultIcons = require('../../cordova/icon').generate,
    generateDefaultSplashscreens = require('../../cordova/splashscreen').generate,
    createFolders = require('../../cordova/assets').createFolders,
    copyDefaultAndroidNotifAssets = require('../../cordova/assets').copyDefaultAndroidNotifAssets;

function generateAssets(color, root, platforms) {
    return generateDefaultIcons(color, root, platforms, 'default')
        .then(function () {
            return generateDefaultSplashscreens(color, root, platforms, 'default');
        });
}

function copyDefaultAssets(root, platforms) {
    return copyDefaultIcons(root, platforms)
        .then(function () {
            return copyDefaultSplashscreens(root, platforms);
        });
}

function copyExtraNotificationAssets(resp) {
    return function () {
        var isNotifAvailable = resp.plugins.map(function (p) {
            return p.value.indexOf('@') > -1 ? p.value.split('@')[0] : p.value;
        }).indexOf('phonegap-plugin-push') > -1;
        if (resp.platforms.map(platformHelper.getName).indexOf('android') > -1 && isNotifAvailable) {
            return copyDefaultAndroidNotifAssets(resp.path);
        }
        return resp;
    };
}

module.exports = function (response) {

    var root = pathHelper.resolve(response.path),
        platforms = response.platforms.map(platformHelper.getName),
        printLog = function () { log.send('success', 'assets folder created'); },
        imagesFolderExists = fs.existsSync(path.resolve(root, settings.images));

    if (response.createProjectFromTarifaFile) {
        if(imagesFolderExists) return Q(response);
        return Q.all(createFolders(root, platforms, 'default'))
                .then(printLog)
                .then(function () { return copyDefaultAssets(root, platforms); })
                .then(copyExtraNotificationAssets(response));
    }

    return Q.all(createFolders(root, platforms, 'default'))
        .then(printLog)
        .then(function () {
            if(response.color) return generateAssets(response.color, root, platforms);
            else return copyDefaultAssets(root, platforms);
        }).then(copyExtraNotificationAssets(response));
};
