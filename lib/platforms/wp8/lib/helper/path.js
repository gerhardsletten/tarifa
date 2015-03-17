var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root,'platforms/wp8/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName) {
    return path.join(platformsRoot, 'wp8', 'Bin', 'Release', productFileName + '.xap');
};

module.exports.productFolder = function productFolder(platformsRoot, productName) {
    throw new Error('No product folder on wp8 platform!');
};
