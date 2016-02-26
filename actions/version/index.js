var Q = require('q'),
    path = require('path'),
    fs = require('q-io/fs'),
    validator = require('../../lib/helper/validator'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    log = require('../../lib/helper/log'),
    tarifaFile = require('../../lib/tarifa-file');

var set = function (version) {
    if(!validator.isVersion(version)) return Q.reject('wrong version format');
    return tarifaFile.parse(pathHelper.root()).then(function (config) {
        config.version = version;
        return tarifaFile.write(pathHelper.root(), config);
    });
};

var get = function () {
    return tarifaFile.parse(pathHelper.root()).then(function (config) {
        if(config.version) log.send('msg', config.version);
        else log.send('msg', 'version not available in tarifa.json');
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
