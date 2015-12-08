var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root, 'platforms/windows/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName) {
    throw new Error('No product file on windows platform!');
};

module.exports.productFolder = function productFolder(platformsRoot, productName) {
    return path.join(platformsRoot, 'windows', productName);
};
