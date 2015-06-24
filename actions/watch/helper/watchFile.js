var chokidar = require('chokidar'),
    Q = require('q'),
    log = require('../../../lib/helper/log');

module.exports = function watchFile(filePath) {
    var d = Q.defer(),
        w = chokidar.watch(filePath),
        onError = function (error) {
            log.send('error', error);
            return d.reject(format('cannot watch %s', filePath));
        };
    w.once('ready', function () {
        w.removeListener('error', onError);
        log.send('success', 'watching %s', filePath);
        d.resolve(w);
    });
    w.once('error', onError);
    return d.promise;
};
