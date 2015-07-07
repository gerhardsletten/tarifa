var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root, 'platforms/ios/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName) {
    return path.join(platformsRoot, 'ios', productFileName.replace(/ /g, '\\ ') + '.ipa');
};

module.exports.productFolder = function productFolder(platformsRoot, productName) {
    return path.join(platformsRoot, 'ios', productName + '.app');
};
