var Q = require('q'),
    log = require('../../../../../helper/log'),
    copyDrawables = require('../../../lib/assets').copyDrawables;

module.exports = function (msg) {
    return copyDrawables(msg.configuration).then(function () {
        log.send('success', 'Copied extra drawables for android');
        return msg;
    }, function(err) {
        log.send('error', 'Failed to copy extra drawables for android: %s', err);
        return Q.reject(err);
    });
};
