var Q = require('q'),
    os = require('os'),
    exec = require('child_process').exec,
    settings = require('./settings');

var parse = function (str) {
    return str.split('\n')
        .filter(function (l) { return l.trim().length > 0; })
        .filter(function (l) { return l.split(':').length === 3; })
        .filter(function (l) { return l.split(':')[2].trim() === 'Device'; })
        .map(function (l) { return { id: l.split(':')[1].trim() }; });
};

var list = function () {
    if (os.platform() !== 'win32') return Q.resolve([]);
    var defer = Q.defer(),
        cmd = settings.external.cordovadeploy.name + ' -devices';
    exec(cmd, function (error, stdout) {
        if (error !== null)
            defer.reject(error);
        else
            defer.resolve(parse(stdout.toString()));
    });
    return defer.promise;
};

module.exports = {
    list: list,
    isSupported: true
};
