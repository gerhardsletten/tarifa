var Q = require('q'),
    rimraf = require('rimraf'),
    spinner = require('char-spinner'),
    path = require('path'),
    fs = require('q-io/fs'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    log = require('../../lib/helper/log'),
    tarifaFile = require('../../lib/tarifa-file');

var set = function (version) {
    var cwd = process.cwd(),
        conf = [tarifaFile.parse(pathHelper.root())];

    return Q.all(conf).spread(function (config) {
        config.version = version;
        return Q.when(config, function (c) {
            return tarifaFile.write(cwd, c);
        });
    }).then(function (msg) {
        process.chdir(cwd);
        return msg;
    }, function (err) {
        process.chdir(cwd);
        throw err;
    });
};

var get = function () {
    var conf = [tarifaFile.parse(pathHelper.root())];

    return Q.all(conf).spread(function (config) {
        return Q.resolve(config.version);
    }).then(function (msg) {
        if(msg) log.send('msg', msg);
        return msg;
    }, function (err) {
        throw err;
    });
};

var actions = {
  get: get,
  set: set
};

var action = function (argv) {
    var helpOpt = argsHelper.matchSingleOption(argv, 'h', 'help');
    if(argsHelper.matchArgumentsCount(argv, [0, 1, 2]) && !helpOpt) {
      var method = actions[argv._[0] || 'get'];
      if (method) {
        return method(argv._[1]);
      }
    }
    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

module.exports = action;
