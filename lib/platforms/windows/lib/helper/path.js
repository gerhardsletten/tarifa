var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root, 'platforms/windows/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName) {
    // FIXME in this case, we have a produt folder...
    // return path.join(platformsRoot, 'windows', productFileName + '.appx');
};

module.exports.productFolder = function productFolder(/*platformsRoot, productName*/) {
    // FIXME
    throw new Error('No product folder on windows platform!');
};
