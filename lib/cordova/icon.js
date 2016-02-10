var path = require('path'),
    copyDefaultAssets = require('./assets').copyDefaultAssets,
    copyAssets = require('./assets').copyAssets,
    rawGenerate = require('./assets').generate,
    rawGenerateFromFile = require('./assets').generateFromFile,
    settings = require('../settings'),
    mapping = {};

settings.platforms.forEach(function (platform) {
    mapping[platform] = require(path.join(__dirname, '../platforms', platform, 'lib/assets')).icons;
});

module.exports.copyDefault = function copyDefault(root, platforms) {
    return copyDefaultAssets(mapping, root, platforms, 'icons');
};

module.exports.copyIcons = function copyIcons(root, platform, configuration, version) {
    return copyAssets(root, mapping, platform, configuration, 'icons', version);
};

module.exports.generate = function generate(color, root, platforms, config) {
    return rawGenerate(mapping, color, 'icons', root, platforms, config);
};

module.exports.generateFromFile = function generateFromFile(file, root, platforms, config, color) {
    return rawGenerateFromFile(mapping, file, root, platforms, config, color);
};
