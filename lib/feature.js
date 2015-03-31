var path = require('path'),
    fs = require('fs'),
    feature = {};

feature.isAvailable = function (name, platform) {
    var modulePath = path.resolve(__dirname, 'platforms', platform, 'lib', 'feature.js');
    return fs.existsSync(modulePath) ? require(modulePath)[name] : true;
};

module.exports = feature;
