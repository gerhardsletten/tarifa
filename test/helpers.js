var path = require('path'),
    format = require('util').format,
    catNames = require('cat-names');

function cat() { return catNames.random().replace(/ /g, '').toLowerCase(); }

module.exports.catValues = function () {
    var tmpPath = path.resolve(__dirname, '../test/tmp/', cat()),
        id = format('%s.%s', cat(), cat()),
        name = cat();

    return {
        tmpPath: tmpPath,
        id: id,
        name: name
    };
};

module.exports.cmd = function (args) {
    return format('node %s %s', path.resolve(__dirname, '../bin/cmd.js'), args);
};
