var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root,'platforms/android/assets/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName, arch) {
    productFileName = arch ? productFileName + '-' + arch : productFileName;
    return path.join(platformsRoot, 'android', productFileName + '.apk');
};

module.exports.productFolder = function productFolder(platformsRoot, productName) {
    throw new Error('No product folder on android platform!');
};
