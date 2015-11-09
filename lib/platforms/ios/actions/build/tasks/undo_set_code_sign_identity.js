var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var identity = settings.default_apple_developer_identity,
        newIdentity = 'CODE_SIGN_IDENTITY = ' + identity,
        xcconfigPath = path.join(pathHelper.app(), 'platforms', 'ios', 'cordova', 'build-release.xcconfig'),
        sign = /CODE_SIGN_IDENTITY = .*$/,
        sign_resource = /CODE_SIGN_RESOURCE_RULES_PATH = .*\n/,
        content = fs.readFileSync(xcconfigPath, 'utf-8').replace(sign, newIdentity).replace(sign_resource, '');
    fs.writeFileSync(xcconfigPath, content);
    log.send('success', '[ios] reset apple developer identity to default: %s', identity);
    return Q.resolve(msg);
};
