var Q = require('q'),
    tmp = require('tmp'),
    fs = require('fs'),
    format = require('util').format,
    ncp = require('ncp').ncp,
    exec = require('child_process').exec,
    path = require('path'),
    settings = require('../../../../../settings'),
    log = require('../../../../../helper/log'),
    nomad = require('../../helper/nomad');

function download(user, team, password, name, profile_path) {
    var defer = Q.defer(),
        t = nomad.team(team),
        cmd = format(
            '%s profiles:download %s -u %s -p $\'%s\' %s --type distribution',
            settings.external.ios.name,
            name,
            user,
            password,
            t
        );

    tmp.dir(function _tempDirCreated(err, tmppath) {
        if (err) return defer.reject('Error while downloading provisioning file: ' + err);

        var options = {
            cwd: tmppath,
            timeout: 40000,
            maxBuffer: 1024 * 400
        };
        exec(cmd, options, function (cmdErr, stdout) {
            if(cmdErr) {
                log.send('error', 'command: %s', cmd);
                defer.reject('ios stderr ' + cmdErr);
                return;
            }
            log.send('success', 'try to copy provision');
            ncp.limit = 1;
            var profilePath = path.resolve(profile_path);
            if(fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
            var trimedName = name.replace(/-/g, '')
                                .replace(/ /g, '_').replace(/\./g, ''),
                newProfilePath = path.join(
                    tmppath,
                    trimedName + '.mobileprovision'
                );
            ncp(newProfilePath, profilePath, function (ncpErr) {
                if (ncpErr) return defer.reject(ncpErr);
                log.send('success', 'provisioning profile fetched');
                var output = stdout.toString();
                defer.resolve(output);
            });
        });
    });

    return defer.promise;
}

module.exports = download;
