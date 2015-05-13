var Q = require('q'),
    exec = require('child_process').exec,
    path = require('path'),
    format = require('util').format,
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    ask = require('../../../../../questions/ask'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations.wp8[msg.configuration],
        release = conf['release'],
        label = conf['sign'];

    if(!release || !label) return Q.resolve(msg);

    var signingConf = msg.localSettings.signing.wp8[label],
        certificate_path = signingConf.certificate_path,
        certificate_password = msg.wp8_certif_password || signingConf.certificate_password,
        product_file_name = conf['product_file_name'] + '.xap',
        output = path.join(pathHelper.app(), 'platforms', 'wp8', product_file_name),
        bin = settings.external.xapsigntool.name,
        defer = Q.defer(),
        options = {
            timeout : 0,
            maxBuffer: 1024 * 400
        },
        passwordPromise = certificate_password
            ? Q(certificate_password)
            : ask.password('What is the password of your certificate?');

    passwordPromise.then(function (password) {
        var cmd = format("%s sign /v /f %s /p %s %s", bin, certificate_path, password, output);
        exec(cmd, options, function (err, stdout, stderr) {
            if(err) {
                defer.reject(format('%s %s', cmd, err));
                return;
            }
            if(msg.verbose){
                print(stdout.toString());
                print.success('signed %s', product_file_name);
            }
            defer.resolve(msg);
        });
    });
    return defer.promise;
};
