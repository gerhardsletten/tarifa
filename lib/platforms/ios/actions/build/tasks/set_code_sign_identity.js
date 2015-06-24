var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var label = msg.localSettings.configurations.ios[msg.configuration].signing;

    if(label) {
        var identity = msg.localSettings.signing.ios[label]['identity'],
            newIdentity = 'CODE_SIGN_IDENTITY = ' + identity + '\n';
            xcconfigPath = path.join(pathHelper.app(), 'platforms/ios/cordova/build-release.xcconfig'),
            content = fs.readFileSync(xcconfigPath, 'utf-8').replace(/CODE_SIGN_IDENTITY =.*\n/, newIdentity);

        fs.writeFileSync(xcconfigPath, content);
        log.send('success', '[ios] change apple developer identity to %s', identity);
    }
    return Q.resolve(msg);
};
