var Q = require('q'),
    format = require('util').format,
    path = require('path'),
    restler = require('restler'),
    log = require('../../../lib/helper/log'),
    pathHelper = require('../../../lib/helper/path');

var rewritePathƒ = function (projectOutput, ip) {
    return function (filePath, httpPort) {
        var srcPath = pathHelper.resolve(projectOutput),
            url = format('http://%s:%s', ip, httpPort);
        return filePath.replace(srcPath, url).replace(path.sep, '/');
    };
};

module.exports = function (ip, httpPort, lrPort, project_output, file) {
    var defer = Q.defer(),
        rewritePath = rewritePathƒ(project_output, ip);
    restler.post(format('http://%s:%s/changed', ip, lrPort), {
        data: JSON.stringify({ files: rewritePath(file, httpPort) })
    }).on('complete', function(rst, resp) {
        if (rst instanceof Error) {
            log.send('error', 'can not update live reload %s', rst.message);
        }
        else if (resp.statusCode >= 200 && resp.statusCode < 300) {
            log.send('success', 'live reload updated: %s', rewritePath(file, httpPort));
        } else {
            log.send('error', 'can not update live reload %s', resp.statusCode);
        }
        defer.resolve();
    });
    return defer.promise;
};
