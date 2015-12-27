var path = require('path'),
    fs = require('fs'),
    untildify = require('untildify'),
    settings = require('../settings');

var root = module.exports.root = function () {
    var find = function (dirname) {
        var tarifaFileExists = fs.existsSync(path.join(dirname, settings.publicTarifaFileName));
        if (tarifaFileExists) {
            return dirname;
        } else {
            var isRoot = /^[^\/]*\/$|^[^\\]*\\$/.test(dirname);
            if (isRoot)
                return dirname;
            else
                return find(path.join(dirname, '..'));
        }
    };
    return find(process.cwd());
};

var app = module.exports.app = function () {
    return path.join(root(), settings.cordovaAppPath);
};

module.exports.cordova_www = function () {
    return path.join(app(), 'www');
};

module.exports.platforms = function () {
    return path.join(app(), 'platforms');
};

module.exports.resolve = function (/* args */) {
    var args = Array.prototype.slice.call(arguments, 0).map(function (s) {
        return s.toString();
    });
    return path.resolve(untildify(path.join.apply(this, args)));
};

module.exports.wwwFinalLocation = function (projectRoot, platform) {
    var p = path.join(projectRoot, settings.cordovaAppPath),
        mod = path.resolve(__dirname, '../platforms', platform, 'lib/helper/path');
    return require(mod).wwwFinalLocation(p);
};

module.exports.productFile = function (platform, productFileName, arch, type) {
    var p = path.join(root(), settings.cordovaAppPath, 'platforms'),
        mod = path.resolve(__dirname, '../platforms', platform, 'lib/helper/path');
    return require(mod).productFile(p, productFileName, arch, type);
};

module.exports.productFolder = function (platform, productName) {
    var p = path.join(root(), settings.cordovaAppPath, 'platforms'),
        mod = path.resolve(__dirname, '../platforms', platform, 'lib/helper/path');
    return require(mod).productFolder(p, productName);
};

module.exports.isFile = function (/* args */) {
    try {
        var args = Array.prototype.slice.call(arguments, 0);
        return fs.statSync(path.resolve(untildify(path.join.apply(this, args)))).isFile();
    } catch(err) {
        if(err.code === 'ENOENT') {
             return false;
        } else {
            throw err;
        }
    }
};

module.exports.isDirectory = function (/* args */) {
    try {
        var args = Array.prototype.slice.call(arguments, 0);
        return fs.statSync(path.resolve(untildify(path.join.apply(this, args)))).isDirectory();
    } catch(err) {
        if(err.code === 'ENOENT') {
             return false;
        } else {
            throw err;
        }
    }
};
