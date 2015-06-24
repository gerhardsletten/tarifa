var Q = require('q'),
    tmp = require('tmp'),
    fs = require('fs'),
    format = require('util').format,
    ncp = require('ncp').ncp,
    exec = require('child_process').exec,
    path = require('path'),
    log = require('../../../../../helper/log');

function download(user, team, password, name, profile_path) {
    var defer = Q.defer(),
        t = (team ?  (" --team " + team) : ''),
        cmd = format("ios profiles:download %s -u %s -p $'%s' %s --type distribution", name,  user, password, t);

    tmp.dir(function _tempDirCreated(err, tmppath) {
        if (err) return defer.reject('Error while downloading provisioning file: ' + err);

        var options = {
            cwd: tmppath,
            timeout : 40000,
            maxBuffer: 1024 * 400
        };
        exec(cmd, options, function (err, stdout, stderr) {
            if(err) {
                log.send('error', 'command: %s', cmd);
                defer.reject('ios stderr ' + err);
                return;
            }
            log.send('success', 'try to copy provision');
            ncp.limit = 1;
            var profilePath = path.resolve(profile_path);
            if(fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
            ncp(path.join(tmppath, name.replace(/-/g,'').replace(/ /g, '_').replace(/\./g, '') + '.mobileprovision'), profilePath, function (err) {
                if (err) return defer.reject(err);
                log.send('success', 'provisioning profile fetched');
                var output = stdout.toString();
                defer.resolve(output);
            });
        });
    });

    return defer.promise;
}

module.exports = download;
