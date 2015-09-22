var Q = require('q'),
    exec = require('child_process').exec,
    settings = require('../../../../settings');

module.exports = function () {
    var defer = Q.defer(),
        child = exec(settings.external.ios.print_version, {
            timeout: 5000
        });

    child.on('exit', function (code) {
        if(code > 0) defer.reject();
        else defer.resolve('ios command not available! cupertino gem is missing...');
    });
    return defer.promise;
};
