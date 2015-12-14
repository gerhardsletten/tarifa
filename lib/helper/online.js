var onLine = require('is-online'),
    Q  = require('q'),
    format = require('util').format,
    log = require('./log');

module.exports = function (opt) {
    var skip = opt.skip || false,
        msg = opt.msg || 'No internet available',
        defer = Q.defer();

    onLine(function (err, isOnline) {
        if(skip) {
            if (!isOnline) log.send('warning', msg);
            defer.resolve(isOnline);
        } else {
            if(isOnline) defer.resolve(true);
            else defer.reject(msg);
        }
    });
    return defer.promise;
};
