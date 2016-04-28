var Q = require('q'),
    findPort = require('find-port'),
    format = require('util').format;

module.exports = function (ip, from, searchRange, returnCount) {
    var d = Q.defer(),
        to = from + searchRange - 1;
    findPort(ip, from, to, function (ports) {
        if (ports.length >= returnCount) {
            d.resolve(ports.slice(0, returnCount));
        } else {
            d.reject(format('could not find %s in range [%s, %s]', returnCount, from, to));
        }
    });
    return d.promise;
};
