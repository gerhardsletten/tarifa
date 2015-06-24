var Q = require('q'),
    log = require('../../../../../helper/log'),
    parse = require('../../../lib/parse-mobileprovision');

module.exports = function (msg) {
    var localSettings = msg.settings;
    if (!localSettings.signing || !localSettings.signing.ios)
        return Q.resolve(msg);

    var signing = localSettings.signing.ios;
    return Object.keys(signing).reduce(function (p, k) {
        return p.then(function () {
            return parse(signing[k].provisioning_path);
        });
    }, Q()).then(function () {
        log.send('success', 'checked project mobile provisioning files!');
        return msg;
    }, function (err) {
        log.send('error', 'check provisioning file failed!');
        return Q.reject(err);
    });
};
