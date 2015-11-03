var Q = require('q'),
    connect = require('connect'),
    format = require('util').format,
    lr = require('connect-livereload'),
    serveStatic = require('serve-static'),
    pathHelper = require('../../../lib/helper/path'),
    log = require('../../../lib/helper/log');

module.exports = function startHttpServer(lrPort, httpPort, platform) {
    var d = Q.defer(),
        app = connect(),
        index = pathHelper.wwwFinalLocation(pathHelper.root(), platform),
        serve = serveStatic(index, {index: false});
    if (lrPort) app.use(lr({port: lrPort}));
    app.use(serve);
    var server = app.listen(httpPort, function () {
        log.send('success', 'started web server on port %s for platform %s', httpPort, platform);
        d.resolve();
    });
    server.on('error', function (err) {
        log.send('info', err);
        d.reject(format('Cannot serve %s on port %s for platform %s', index, httpPort, platform));
    });
    return d.promise;
};
