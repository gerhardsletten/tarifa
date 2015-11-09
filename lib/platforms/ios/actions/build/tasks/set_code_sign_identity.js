var Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var label = msg.localSettings.configurations.ios[msg.configuration].sign,
        sign_resource = 'CODE_SIGN_RESOURCE_RULES_PATH = $(SDKROOT)/ResourceRules.plist\n';
    if(label) {
        var identity = msg.localSettings.signing.ios[label].identity,
            newIdentity = 'CODE_SIGN_IDENTITY = ' + identity + '\n' + sign_resource,
            xcconfigPath = path.join(pathHelper.app(), 'platforms/ios/cordova/build-release.xcconfig'),
            content = fs.readFileSync(xcconfigPath, 'utf-8').replace(/CODE_SIGN_IDENTITY =.*\n/, newIdentity);

        fs.writeFileSync(xcconfigPath, content);

        log.send('success', '[ios] change apple developer identity to %s', identity);
    }
    return Q.resolve(msg);
};
