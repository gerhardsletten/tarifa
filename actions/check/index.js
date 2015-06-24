var Q = require('q'),
    os = require('os'),
    path = require('path'),
    fs = require('q-io/fs'),
    rimraf = require('rimraf'),
    intersection = require('interset/intersection'),
    argsHelper = require('../../lib/helper/args'),
    log = require('../../lib/helper/log'),
    pathHelper = require('../../lib/helper/path'),
    tasksHelper = require('../../lib/helper/tasks'),
    platformHelper = require('../../lib/helper/platform'),
    settings = require('../../lib/settings'),
    tarifaFile = require('../../lib/tarifa-file'),
    builder = require('../../lib/builder'),
    createProject = require('../../lib/create'),
    listAvailableOnHost = require('../../lib/cordova/platforms').listAvailableOnHost,
    platformTasks = tasksHelper.load(settings.platforms, 'check', 'tasks');

function loadUserTasks(platforms, localSettings) {
    var tasks = {},
        checkDef = localSettings.check;
    platforms.forEach(function (p) {
        tasks[p] = checkDef && checkDef[p]
            ? [require(pathHelper.resolve(checkDef[p]))] : [ ];
    });
    return tasks;
}

function launchTasks(message, platforms, tasks, userTasks) {
    return platforms.reduce(function (messg, platform) {
        return Q.when(messg, function (msg) {
            log.send('success', 'start checking %s platform', platform);
            return tasksHelper.execSequence(tasks[platform].map(require))(msg);
        }).then(function (m) {
            log.send('success', 'start user check %s', platform);
            return tasksHelper.execSequence(userTasks[platform])(m);
        });
    }, message);
}

function regenerate() {
    var defer = Q.defer();

    rimraf(pathHelper.app(), function (err) {
        if(err) defer.reject(err);
        else defer.resolve();
    });

    return defer.promise.then(function () {
        return createProject.createFromTarifaJSONFile(pathHelper.root());
    }).then(function () {
        log.send('success', 'regenerate app from tarifa.json');
    });
}

function regenerateTask(force) {
    return fs.exists(pathHelper.app()).then(function (exist) {
        if(exist && !force) return Q();
        return regenerate();
    });
}

var check = function (force) {
    var cwd = process.cwd(),
        root = pathHelper.root();

    return regenerateTask(force).then(function () {
        return Q.all([tarifaFile.parse(root), listAvailableOnHost()]);
    }).spread(function (localSettings, platforms) {
        process.chdir(root);
        var projectPlatforms = localSettings.platforms.map(platformHelper.getName);
        return launchTasks({
                settings: localSettings
            },
            intersection(platforms, projectPlatforms),
            platformTasks,
            loadUserTasks(platforms, localSettings)
        );
    }).then(function (msg) {
        return builder.init(pathHelper.root());
    }).then(function (val) {
        process.chdir(cwd);
        return val;
    }, function (err) {
        process.chdir(cwd);
        return Q.reject(err);
    });
};

var action = function (argv) {
    if(argsHelper.matchArgumentsCount(argv, [0])
            && argsHelper.checkValidOptions(argv, ['force'])) {
        var force = argsHelper.matchOption(argv, 'force');
        return check(force);
    }

    return fs.read(path.join(__dirname, 'usage.txt')).then(console.log);
};

action.check = check;
module.exports = action;
