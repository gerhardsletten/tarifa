var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root, 'platforms/browser/www');
};

module.exports.productFile = function productFile() {
    throw new Error('No product file on browser platform!');
};

module.exports.productFolder = function productFolder() {
    throw new Error('No product folder on browser platform!');
};
