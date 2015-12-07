var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    format = require('util').format,
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

var overwriteGuid = function (msg, manifest) {
    var content = fs.readFileSync(manifest, 'utf-8'),
        conf = msg.localSettings.configurations.windows[msg.configuration],
        reg = /PhoneProductId *= *"(\w{8}(-\w{4}){3}-\w{12}?)"/gi;
    fs.writeFileSync(manifest, content.replace(reg, format('PhoneProductId="%s"', conf.guid)));
    log.send('success', 'trying to overwrite guid %s in %s', conf.guid, manifest);
    return msg;
};

module.exports = function (msg) {
    var winPath = path.join(pathHelper.platforms(), 'windows'),
        manifests = [
            'package.windows.appxmanifest',
            'package.windows80.appxmanifest',
            'package.phone.appxmanifest',
            'package.windows10.appxmanifest'
        ].map(function (p) { return path.resolve(winPath, p); });
        conf = msg.localSettings.configurations.windows[msg.configuration];
    if(!conf.guid)
        return Q.reject(format('missing guid attribute in configuration "%s" edit your tarifa.json', msg.configuration));
    return manifests.reduce(overwriteGuid, msg);
};