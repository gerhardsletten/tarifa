var path = require('path'),
    fs = require('fs'),
    feature = {};

feature.isAvailable = function (name, platform) {
    var modulePath = path.resolve(
            __dirname, 'platforms', platform, 'lib/feature.js'
        ),
        moduleExists = fs.existsSync(modulePath);
    return moduleExists ? require(modulePath)[name] !== false : true;
};

module.exports = feature;
