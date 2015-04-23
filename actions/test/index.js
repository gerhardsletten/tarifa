var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    format = require('util').format,
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    print = require('../../lib/helper/print'),
    builder = require('../../lib/builder'),
    feature = require('../../lib/feature'),
    buildAction = require('../build'),
    askDevice = require('../run/ask_device'),
    devices = require('../../lib/devices'),
    tarifaFile = require('../../lib/tarifa-file');

var log = function (o) { print(o.toString().replace(/\n/g, '')); };

var launchAppiumServer = function (conf) {
    var args = "--command-timeout 7200 --automation-name Appium --log-level debug".split(' ');
    conf.appiumChild = spawn(path.resolve(__dirname, '../../node_modules/appium/bin/appium.js'), args);
    if(conf.verbose) conf.appiumChild.stdout.on('data', log);
    if(conf.verbose) conf.appiumChild.stderr.on('data', log);
    return Q.delay(conf, 2000);
};

var launchIosWebkitDebugProxy = function (conf) {
    if (conf.platform === 'ios') {
        var args = format("-c %s:27753", conf.device.value).split(' ');
        conf.IosWebkitDebugProxy = spawn('ios_webkit_debug_proxy', args);
        if(conf.verbose) conf.IosWebkitDebugProxy.stdout.on('data', log);
        if(conf.verbose) conf.IosWebkitDebugProxy.stderr.on('data', log);
        return Q.delay(conf, 1000);
    } else {
        return conf;
    }
};

var findAndroidPlatformVersion = function (conf) {
    var d = Q.defer(),
        cmd = format('adb -s %s shell "grep ro.build.version.release= system/build.prop"', conf.device.value);
    exec(cmd, function (err, stdout, stderr) {
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

    return devices[conf.platform].info(true).then(function (items) {
        var rslt = items.filter(function (item) {
            return item.udid && item.udid === conf.device.value;
        });

        if(rslt.length > 0) { // ios
            conf.caps.udid = conf.device.value;
            conf.caps.deviceName = rslt[0].name;
            conf.caps.platformVersion = rslt[0].productVersion;
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
            conf.appiumConf,
            conf.verbose
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

var test = function (platform, config, verbose) {
    return tarifaFile.parse(pathHelper.root(), platform, config).then(function (localSettings) {
        if(!feature.isAvailable('test', platform))
            return Q.reject(format('feature not available on %s!', platform));
        return {
            localSettings: localSettings,
            platform: platform,
            configuration: config,
            verbose: verbose,
            debug:true // to allow only 1 device on `askDevice`
        };
    })
    .then(askDevice)
    .then(buildAction.buildƒ)
    .then(launchAppiumServer)
    .then(launchIosWebkitDebugProxy)
    .then(genDefaultCaps)
    .then(runTest);
};

var action = function (argv) {
    var verbose = false,
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.matchArgumentsCount(argv, [1,2])
            && argsHelper.checkValidOptions(argv, ['V', 'verbose'])) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }
        return test(argv._[0], argv._[1] || 'default', verbose);
    }

    return fs.read(helpPath).then(print);
};

module.exports = action;
