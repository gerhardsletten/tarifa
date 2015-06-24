var tinylr = require('tiny-lr-fork'),
    Q = require('q'),
    log = require('../../../lib/helper/log');

module.exports = function startLiveReloadServer(port) {
    var d = Q.defer();
    tinylr().listen(port, function (err) {
        if (err) {
            log.send('error', 'error while starting live reload server %s', err);
            d.reject(err);
        } else {
            log.send('success', 'started live reload server on port %s', port);
            d.resolve();
        }
    });
    return d.promise;
};
