var path = require('path'),
    copyDefaultAssets = require('./assets').copyDefaultAssets,
    copyAssets = require('./assets').copyAssets,
    rawGenerate = require('./assets').generate,
    settings = require('../settings'),
    mapping = {};

settings.platforms.forEach(function (platform) {
    mapping[platform] = require(path.join(__dirname, '../platforms', platform, 'lib/assets')).splashscreens;
});

module.exports.copyDefault = function copyDefault(root, platforms) {
    return copyDefaultAssets(mapping, root, platforms, 'splashscreens');
};

module.exports.copySplashscreens = function copySplashscreens(root, platform, configuration, version) {
    return copyAssets(root, mapping, platform, configuration, 'splashscreens', version);
};

module.exports.generate = function generate(color, root, platforms, config) {
    return rawGenerate(mapping, color, 'splashscreens', root, platforms, config);
};
