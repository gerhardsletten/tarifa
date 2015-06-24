var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    log = require('../../../../../helper/log');

function parse(stdout) {
    var output = stdout.toString().split('\n');
    output = output.slice(5, output.length-2);

    return output.map(function (line) {
        var r = line.split('|').filter(function (w) { return w.length > 0; });
        return {
            name: r[0].trim(),
            uuid: r[1].trim(),
            enabled: r[2].trim() === 'Y'
        }
    });
}

function getDevices(user, team, password) {
    var defer = Q.defer(),
        options = {
            timeout : 100000,
            maxBuffer: 1024 * 400
        },
        t = (team ?  (" --team " + team) : ''),
        cmd = format("ios devices:list -u %s -p $'%s' %s", user, password, t);
    exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            log.send('error', 'command: %s', cmd);
            defer.reject('ios stderr ' + err);
            return;
        }
        defer.resolve(parse(stdout));
    });

    return defer.promise;
}

module.exports = getDevices;
