var fs = require('q-io/fs'),
    path = require('path'),
    argsHelper = require('../../lib/helper/args');

module.exports = function (argv) {
    if (argsHelper.checkValidOptions(argv, [])) {
        if (argsHelper.matchArgumentsCount(argv, [0]) || argsHelper.matchCmd(argv._, ['project'])) {
            return require('./project')();
        }
        if (argsHelper.matchCmd(argv._, ['plugin'])) {
            return require('./plugin')();
        }
    }
    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};
