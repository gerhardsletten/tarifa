var Q = require('q'),
    exec = require('child_process').exec,
    path = require('path'),
    format = require('util').format,
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path');

module.exports = function (msg) {
    var manifestPath = path.join(pathHelper.app(), 'platforms', 'android'),
        cmd = format('android -s update project -p "%s -s', manifestPath),
        defer = Q.defer(),
        options = {
            timeout: 0,
            maxBuffer: 1024 * 400
        };

    var child = exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            log.send('error', 'command: %s', cmd);
            log.send('error', 'android stderr %s', stderr);
            defer.reject('android ' + err);
            return;
        }
        log.send('success', 'updated android project!');
        defer.resolve(msg);
    });

    child.stdout.on('data', function (message) {
        log.send('info', message.replace(/\n/g, '').toString());
    });

    return defer.promise;
};
