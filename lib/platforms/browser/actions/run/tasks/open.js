var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    path = require('path'),
    chalk = require('chalk'),
    Configstore = require('configstore'),
    log = require('../../../../../helper/log'),
    pathHelper = require('../../../../../helper/path'),
    confStore = new Configstore('tarifa');

function openChromeOnDarwin(conf) {
    var defer = Q.defer(),
        cmd = path.join('platforms', 'browser', 'cordova', 'run'),
        options = {
            cwd: pathHelper.app(),
            timeout: 100000,
            maxBuffer: 1024 * 400
        };

    log.send('success', 'trying to open browser!');

    exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            log.send('error', 'command: %s', cmd);
            log.send('error', 'stderr %s', stderr);
            defer.reject(cmd + ' command failed;');
        }
        else {
            defer.resolve(conf);
        }
    });

    return defer.promise;
}

function openChromeOnWin32(conf) {
    var indexPath = path.resolve(pathHelper.app(), 'platforms', 'browser', 'www', 'index.html'),
        project = format('file://%s', indexPath),
        child = spawn(
            confStore.get('chrome') || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            ['--user-data-dir=C:/Chromedevsession', '--disable-web-security', project],
            { detached: true, stdio: 'ignore'}
        );

    child.on('error', function (err){
        if(err.code === 'ENOENT')
            log.send('error', 'can not find chrome, check ~/.config/configstore/tarifa.yml and add a chrome attribute with the right path as value');
        else log.send('error', chalk.red(err.stack || err));
    });

    child.unref();
    return Q.resolve(conf);
}

function openChromeOnLinux(conf) {
    var indexPath = path.resolve(pathHelper.app(), 'platforms', 'browser', 'www', 'index.html'),
        project = format('file://%s', indexPath),
        child = spawn(
            confStore.get('chrome') || 'chrome-browser',
            ['--user-data-dir=/tmp/temp_chrome_user_data_dir_for_cordova_browser', '--disable-web-security', project],
            { detached: true, stdio: 'ignore'}
        );

    child.on('error', function (err){
        if(err.code === 'ENOENT')
            log.send('error', 'can not find chrome, check ~/.config/configstore/tarifa.yml and add a chrome attribute with the right path as value');
        else log.send('error', chalk.red(err.stack || err));
    });

    child.unref();
    return Q.resolve(conf);
}

module.exports = function (conf) {
    switch(process.platform) {
        case 'darwin':
            return openChromeOnDarwin(conf);
        case 'win32':
            return openChromeOnWin32(conf);
        case 'linux':
            return openChromeOnLinux(conf);
        default:
            return Q.reject(format('Can not run on platform %s!', process.platform));
    }
};
