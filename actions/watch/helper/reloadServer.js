var tinylr = require('tiny-lr-fork'),
    Q = require('q'),
    print = require('../../../lib/helper/print');

module.exports = function startLiveReloadServer(port, verbose) {
    var d = Q.defer();
    tinylr().listen(port, function (err) {
        if (err) {
            print.error('error while starting live reload server %s', err);
            d.reject();
        } else {
            if (verbose) { print.success('started live reload server on port %s', port); }
            d.resolve();
        }
    });
    return d.promise;
};
