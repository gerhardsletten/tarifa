var Q = require('q'),
    connect = require("connect"),
    lr = require('connect-livereload'),
    serveStatic = require('serve-static')
    pathHelper = require('../../../lib/helper/path'),
    print = require('../../../lib/helper/print');

module.exports = function startHttpServer(lrPort, httpPort, platform, verbose) {
    var d = Q.defer(),
        app = connect(),
        index = pathHelper.wwwFinalLocation(pathHelper.root(), platform),
        serve = serveStatic(index, {index: false});
    app.use(lr({port: lrPort}));
    app.use(serve);
    var server = app.listen(httpPort, function () {
        print.success('started web server on port %s for platform %s', httpPort, platform);
        d.resolve();
    });
    server.on('error', function (err) {
        if (verbose) { print(err); }
        d.reject(format('Cannot serve %s on port %s for platform %s', index, httpPort, platform));
    });
    return d.promise;
};
