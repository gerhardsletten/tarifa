var Q = require('q'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    copyIcons = require('../../../../../cordova/icon').copyIcons;

module.exports = function (msg) {
    return copyIcons(pathHelper.root(), msg.platform, msg.configuration)
    .then(function () {
        log.send('success', 'copied icons for platform %s', msg.platform);
        return msg;
    }, function(err) {
        log.send('error', 'Failed to copy icons: %s', err);
        return Q.reject(err);
    });
};
