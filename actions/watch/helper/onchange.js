var Q = require('q'),
    format = require('util').format,
    path = require('path'),
    restler = require('restler'),
    log = require('../../../lib/helper/log'),
    pathHelper = require('../../../lib/helper/path');

var rewritePathƒ = function (projectOutput, ip) {
    return function (filePath, httpPort) {
        var srcPath = pathHelper.resolve(projectOutput);
        return filePath.replace(srcPath, format('http://%s:%s', ip, httpPort)).replace(path.sep, '/');
    };
};

module.exports = function onchange(ip, httpPort, lrPort, project_output, file) {

    var defer = Q.defer(),
        rewritePath = rewritePathƒ(project_output, ip);
    restler.post(format('http://%s:%s/changed', ip, lrPort), {
        data: JSON.stringify({ files: rewritePath(file, httpPort) })
    }).on('complete', function(data, response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            log.send('success', 'live reload updated: %s', rewritePath(file, httpPort));
        } else {
            log.send('error', 'can not update live reload %s', response.statusCode);
        }
        defer.resolve();
    });
    return defer.promise;
};
