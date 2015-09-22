var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings'),
    parseProvisionFile = require('../../parse-mobileprovision');

function call(action, user, team, password, uuid, profile_path, devices) {
    var c = '%s profiles:manage:devices:%s %s "%s"=%s -u %s -p $\'%s\' %s',
        device = devices.filter(function (d) { return d.uuid.trim() === uuid; } )[0],
        t = (team ? (' --team ' + team) : ''),
        options = {
            timeout: 40000,
            maxBuffer: 1024 * 400
        };

    if(!device) return Q.reject('uuid is not included in the developer center!');

    return parseProvisionFile(profile_path).then(function (provisioning) {
        var defer = Q.defer(),
            cmd = format(
                c,
                settings.external.ios.name,
                action,
                provisioning.name,
                device.name.trim(),
                uuid,
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

            var output = stdout.toString().split('\n');
            log.send('info', output.toString());
            defer.resolve(output.toString());
        });

        return defer.promise;
    });
}

module.exports.add = function (user, team, password, uuid, profile_path, devices) {
    return call('add', user, team, password, uuid, profile_path, devices);
};

module.exports.remove = function (user, team, password, uuid, profile_path, devices) {
    return call('remove', user, team, password, uuid, profile_path, devices);
};
