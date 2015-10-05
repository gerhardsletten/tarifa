var pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    copySplashscreens = require('../../../../../cordova/splashscreen').copySplashscreens;

module.exports = function (msg) {
    return copySplashscreens(pathHelper.root(), msg.platform, msg.configuration)
        .then(function () {
            log.send('success', 'copied splash screens for platform %s', msg.platform);
            return msg;
        }, function(err) {
            log.send('warning', 'Failed to copy splash screens: %s', err);
            return msg;
        });
};
