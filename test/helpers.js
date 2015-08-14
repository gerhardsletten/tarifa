var path = require('path'),
    format = require('util').format;

module.exports.cmd = function (args) {
    return format('node %s %s', path.resolve(__dirname, '../bin/cmd.js'), args);
};
