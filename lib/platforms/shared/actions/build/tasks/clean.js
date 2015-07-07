var pathHelper = require('../../../../../helper/path'),
    cordovaClean = require('../../../../../cordova/clean');

module.exports = function (msg) {
    return cordovaClean(pathHelper.root(), [msg.platform]).then(function () {
        return msg;
    });
};
