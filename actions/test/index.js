var Q = require('q'),
    fs = require('q-io/fs'),
    os = require('os'),
    path = require('path'),
    format = require('util').format,
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    log = require('../../lib/helper/log'),
    builder = require('../../lib/builder'),
    feature = require('../../lib/feature'),
    buildAction = require('../build'),
    askDevice = require('../run/ask_device'),
    devices = require('../../lib/devices'),
    tarifaFile = require('../../lib/tarifa-file');

var logging = function (o) { log.send('info', o.toString().replace(/\n/g, '')); };

var launchAppiumServer = function (conf) {
    var appiumNpm2 = path.resolve(__dirname, '../../node_modules/appium/bin/appium.js'),
        appiumNpm3 = path.resolve(__dirname, '../../../node_modules/appium/bin/appium.js'),
        cmd = pathHelper.isFile(appiumNpm2) ? appiumNpm2 : appiumNpm3,
        args = '--command-timeout 7200 --automation-name Appium --log-level debug';
    if (os.platform() === 'win32') {
        args = cmd + ' ' + args;
        cmd = 'node';
        console.log(cmd + ' ' + args);
    }

    conf.appiumChild = spawn(cmd, args.split(' '));
    conf.appiumChild.stdout.on('data', logging);
    conf.appiumChild.stderr.on('data', logging);

    return Q.delay(conf, 2000);
};

var launchIosWebkitDebugProxy = function (conf) {
    if (conf.platform === 'ios') {
        var args = format('-c %s:27753', conf.device.value).split(' ');
        conf.IosWebkitDebugProxy = spawn('ios_webkit_debug_proxy', args);
        conf.IosWebkitDebugProxy.stdout.on('data', logging);
        conf.IosWebkitDebugProxy.stderr.on('data', logging);
        return Q.delay(conf, 1000);
    } else {
        return conf;
    }
};

var findAndroidPlatformVersion = function (conf) {
    var d = Q.defer(),
        cmd = format('adb -s %s shell "grep ro.build.version.release= system/build.prop"', conf.device.value);
    exec(cmd, function (err, stdout) {
        if (err) { d.reject(err); return; }
        d.resolve(stdout.toString().replace(/\n|\r/g, '').replace('ro.build.version.release=', ''));
    });
    return d.promise;
};

var genDefaultCaps = function (conf) {
    var config = conf.localSettings.configurations,
        c = config[conf.platform][conf.configuration],
        appPath;

    try {
        appPath = pathHelper.productFolder(conf.platform, c.product_name);
    } catch(err) {
        appPath = pathHelper.productFile(conf.platform, c.product_file_name);
    }

    conf.appiumConf = { host: 'localhost', port: 4723 };

    conf.caps = {
        browserName: '',
        'appium-version': '1.3',
        platformName: conf.platform,
        automationName: 'Appium',
        deviceName: conf.device.value,
        app: appPath,
        autoWebview: true
    };

    return devices.list(conf.platform).then(function (items) {
        var rslt = items.filter(function (item) {
            return item.description.udid && item.description.udid === conf.device.value;
        });

        if(rslt.length > 0) { // ios
            conf.caps.udid = conf.device.value;
            if (!rslt[0].description.name)
                return Q.reject('Not able to find device name!');
            conf.caps.deviceName = rslt[0].description.name;
            conf.caps.platformVersion = rslt[0].description.productVersion;
            return conf;
        } else { // android
            return findAndroidPlatformVersion(conf).then(function (v) {
                conf.caps.platformVersion = v;
                return conf;
            });
        }
    });
};

var runTest = function (conf) {
    return builder.test(
            pathHelper.root(),
            conf.platform,
            conf.localSettings,
            conf.configuration,
            conf.caps,
            conf.appiumConf
        ).then(function () {
            conf.appiumChild.kill();
            if(conf.IosWebkitDebugProxy) conf.IosWebkitDebugProxy.kill();
            return conf;
        }, function (err) {
            conf.appiumChild.kill();
            if(conf.IosWebkitDebugProxy) conf.IosWebkitDebugProxy.kill();
            return Q.reject(err);
        });
};

var test = function (platform, config) {
    return tarifaFile.parse(pathHelper.root(), platform, config).then(function (localSettings) {
        if(!feature.isAvailable('test', platform))
            return Q.reject(format('feature not available on %s!', platform));
        if(platform === 'android' && localSettings.plugins['cordova-plugin-crosswalk-webview'])
            return Q.reject(format('[android] appium does not support crosswalk!'));
        return {
            localSettings: localSettings,
            platform: platform,
            configuration: config,
            log: true // to allow only 1 device on `askDevice`
        };
    })
    .then(askDevice)
    .then(genDefaultCaps)
    .then(launchAppiumServer)
    .then(buildAction.buildƒ)
    .then(launchIosWebkitDebugProxy)
    .then(runTest);
};

var action = function (argv) {
    if(argsHelper.matchArgumentsCount(argv, [1, 2]))
        return test(argv._[0], argv._[1] || 'default');

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

action.test = test;
module.exports = action;
