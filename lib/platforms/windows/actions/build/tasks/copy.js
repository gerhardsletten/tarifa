var Q = require('q'),
    path = require('path'),
    archiver = require('archiver'),
    fs = require('fs'),
    ncp = require('ncp').ncp,
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log');

module.exports = function (msg) {
    var defer = Q.defer(),
        conf = msg.localSettings.configurations.windows[msg.configuration],
        src = path.resolve(pathHelper.platforms(), 'windows', 'AppPackages'),
        dest = path.resolve(pathHelper.platforms(), 'windows', conf.product_file_name);

    ncp(src, dest, function (err) {
        if (err) return defer.reject(err);
        log.send('success', '[windows] copy package folder to %s ', conf.product_file_name);
        var output = fs.createWriteStream(path.resolve(dest, 'windows.zip')),
            zip = archiver('zip');

        zip.pipe(output);

        fs.readdir(dest, function (err, files) {
            if (err) return defer.reject(err);
            var winFolder = files.reduce(function (rst, file) {
                if(/.*Windows.*/.test(file)) return file;
                else return rst;
            });
            zip.bulk([
                { src: [ '**/*' ], cwd: path.resolve(dest, winFolder), expand: true }
            ]);
            zip.finalize();
            output.on('close', function() {
                log.send('success', '[windows] zip package to %s ', path.resolve(dest, 'windows.zip'));
                defer.resolve(msg);
            });
        });
    });

    return defer.promise;
};
