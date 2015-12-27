var path = require('path'),
    fs = require('fs');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root, 'platforms/windows/www');
};

module.exports.productFile = function productFile(platformsRoot, productFileName, arch, type) {
    if(type === 'phone') {
        var productFolder = path.join(platformsRoot, 'windows', productFileName),
            phoneFolder = fs.readdirSync(productFolder).reduce(function (rst, file) {
                if(/.*Phone.*/.test(file)) return file;
                else return rst;
            }),
            appxFile = fs.readdirSync(path.resolve(productFolder, phoneFolder)).reduce(function (rst, file) {
                if(/.*\.appx.*/.test(file)) return file;
                else return rst;
            });

        return path.join(productFolder, phoneFolder, appxFile);
    } else if( type === 'desktop') {
        return path.join(platformsRoot, 'windows', productFileName, 'windows.zip');
    } else {
        throw new Error('unvalid productFile type!');
    }
};

module.exports.productFolder = function productFolder(platformsRoot, productName) {
    throw new Error('No product file on windows platform!');
};
