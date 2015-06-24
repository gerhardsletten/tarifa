var Q = require('q'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    platformHelper = require('../../lib/helper/platform'),
    settings = require('../../lib/settings'),
    colorHelper = require('../../lib/helper/color'),
    generateIcons = require('../../lib/cordova/icon').generate,
    generateIconsFromFile = require('../../lib/cordova/icon').generateFromFile,
    generateSplashscreens = require('../../lib/cordova/splashscreen').generate,
    createFolders = require('../../lib/cordova/assets').createFolders;

function generate(color, config, f) {
    config = config || 'default';
    var root = pathHelper.root();
    if(!colorHelper.validate(color)) return Q.reject('invalid color!');

    return tarifaFile.parse(root).then(function (localSettings) {
        var platforms = localSettings.platforms.map(platformHelper.getName);
        return Q.all(createFolders(root, platforms, config)).then(function () {
            return f(color, root, platforms, config);
        });
    });
}

function generateFromFile(file, config, f) {
    config = config || 'default';
    var root = pathHelper.root();

    return tarifaFile.parse(root).then(function (localSettings) {
        var platforms = localSettings.platforms.map(platformHelper.getName);
        return Q.all(createFolders(root, platforms, config)).then(function () {
            return f(file, root, platforms, config);
        });
    });
}

module.exports.generateIcons = function (color, config) {
    return generate(color, config, generateIcons);
};

module.exports.generateIconsFromFile = function (file, config) {
    return generateFromFile(file, config, generateIconsFromFile);
};

module.exports.generateSplashscreens = function (color, config) {
    return generate(color, config, generateSplashscreens);
};
