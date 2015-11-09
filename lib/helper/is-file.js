var untildify = require('untildify'),
    fs = require('fs'),
    path = require('path');

module.exports = function (/* args */) {
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
