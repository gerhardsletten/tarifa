var chokidar = require('chokidar'),
    Q = require('q'),
    print = require('../../../lib/helper/print');

module.exports = function watchFile(filePath, verbose) {
    var d = Q.defer(),
        w = chokidar.watch(filePath),
        onError = function (error) {
            if (verbose) { print(error); }
            return d.reject(format('cannot watch %s', filePath));
        };
    w.once('ready', function () {
        w.removeListener('error', onError);
        if (verbose) { print.success('watching %s', filePath); }
        d.resolve(w);
    });
    w.once('error', onError);
    return d.promise;
};
