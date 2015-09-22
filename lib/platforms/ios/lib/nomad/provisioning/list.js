var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    settings = require('../../../../../settings'),
    log = require('../../../../../helper/log');

function parse(stdout) {
    return stdout.toString()
        .split('\n')
        .filter(function (line) { return line.search('Active') >= 0; })
        .map(function (line) {
            var elts = line.split('|');
            return [elts[1], elts[2]];
        });
}

function list(user, team, password) {
    var defer = Q.defer(),
        options = {
            timeout: 40000,
            maxBuffer: 1024 * 400
        },
        t = (team ? (' --team ' + team) : ''),
        cmd = format(
            '%s profiles:list -u %s -p $\'%s\' %s --type distribution',
            settings.external.ios.name,
            user,
            password,
            t
        );

    exec(cmd, options, function (err, stdout) {
        if(err) {
            log.send('error', 'command: %s', cmd);
            defer.reject('ios stderr ' + err);
            return;
        }
        defer.resolve(parse(stdout));
    });

    return defer.promise;
}

module.exports = list;
