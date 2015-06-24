var Q = require('q'),
    path = require('path'),
    fs = require('q-io/fs'),
    parseProvisionFile = require('../../parse-mobileprovision'),
    log = require('../../../../../helper/log');

module.exports = function (profilePath, remove) {
    var installationDirectory = path.join(
        process.env.HOME,
        'Library',
        'MobileDevice',
        'Provisioning Profiles'
    );
    return parseProvisionFile(profilePath).then(function (parsed) {
        var uuid = parsed.uuid,
            target = path.join(installationDirectory, uuid + '.mobileprovision'),
            mkdir = fs.isDirectory(installationDirectory).then(function (exists) {
                return exists ? Q.resolve() : fs.makeTree(installationDirectory);
            });
        return mkdir.then(function () {
            return fs.copy(profilePath, target).then(function () {
                return target;
            });
        });
    }).then(function (target) {
        log.send('success', 'provisioning profile installed');
        return remove ? fs.remove(profilePath).then(function () {
            return target;
        }) : target;
    });
};
