var fs = require('q-io/fs'),
    path = require('path'),
    argsHelper = require('../../lib/helper/args');

module.exports = function (argv) {
    var options = {
        path: argsHelper.matchOptionWithValue(argv, null, 'path') && argv.path,
        id: argsHelper.matchOptionWithValue(argv, null, 'id') && argv.id,
        name: argsHelper.matchOptionWithValue(argv, null, 'name') && argv.name
    };

    if (argsHelper.checkValidOptions(argv, ['path', 'id', 'name'])) {
        if (argsHelper.matchArgumentsCount(argv, [0]) || argsHelper.matchCmd(argv._, ['project'])) {
            return require('./project')(options);
        }
        if (argsHelper.matchCmd(argv._, ['plugin'])) {
            return require('./plugin')(options);
        }
    }
    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};
