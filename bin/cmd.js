#!/usr/bin/env node
var chalk = require('chalk'),
    Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    util = require('util'),
    argv = require('minimist')(process.argv.slice(2)),
    pkg = require('../package.json'),
    log = require('../lib/helper/log'),
    argsHelper = require('../lib/helper/args');

function printHelp(errMessage) {
    if(errMessage) log.send('error', errMessage);
    fs.read(path.join(__dirname, 'usage.txt'))
        .then(function (help) {
            log.send('msg', help);
            process.exit(0);
        });
}

function printVersion() {
    log.send('msg', pkg.version);
    process.exit(0);
}

var t0 = (new Date()).getTime();

var availableActions = [
        { name: 'create', action: '../actions/create' },
        { name: 'platform', action: '../actions/platform' },
        { name: 'plugin', action: '../actions/plugin' },
        { name: 'prepare', action: '../actions/prepare' },
        { name: 'info', action: '../actions/info' },
        { name: 'config', action: '../actions/config' },
        { name: 'build', action: '../actions/build' },
        { name: 'run', action: '../actions/run' },
        { name: 'clean', action: '../actions/clean' },
        { name: 'cls', action: '../actions/clean' }, // clean alias
        { name: 'check', action: '../actions/check' },
        { name: 'hockeyapp', action: '../actions/hockeyapp' },
        { name: 'update', action: '../actions/update' },
        { name: 'watch', action: '../actions/watch' },
        { name: 'test', action: '../actions/test'},
        { name: 'device', action: '../actions/device'},
        { name: 'devices', action: '../actions/device'} // alias
    ],
    singleOptions = [
        { small: 'v', name: 'version', action: printVersion },
        { small: 'h', name: 'help', action: printHelp }
    ],

    globalOptions = [
        { small: 'd', name: 'debug' }
    ];

function matchAction(args) {
    var actions = availableActions.map(function (a) { return a.name; });
    return args._[0] && actions.indexOf(args._[0]) >= 0;
}

function actionSuccess() {
    var t = (new Date()).getTime();
    log.send(
        'info',
        chalk.magenta('done in ~ %ds'),
        Math.floor((t - t0) / 1000)
    );
    process.exit();
}

function actionError(name, options) {
    return function (err) {
        log.send('error', chalk.red(err.stack || err));
        if(!options.debug) {
            log.send(
                'msg',
                chalk.yellow('use -d or --debug for more helpful stack trace!')
            );
        }
        process.exit(1);
    };
}

function main(args) {
    log.init(argsHelper.matchOption(argv, 'V', 'verbose'));

    var validArgs = false,
        keys = Object.keys(args),
        options = { };

    for(var i = 0, l = singleOptions.length; i < l; i++) {
        validArgs = argsHelper.matchSingleOptionWithArguments(
            args, singleOptions[i].small, singleOptions[i].name, [0]
        );

        if(validArgs) {
            return singleOptions[i].action();
        }
    }

    globalOptions.forEach(function (opt) {
        if(keys.indexOf(opt.small) > -1) options[opt.name] = args[opt.small];
        if(keys.indexOf(opt.name) > -1) options[opt.name] = args[opt.name];
        delete args[opt.small];
        delete args[opt.name];
    });

    if(options.debug) Q.longStackSupport = true;

    if(matchAction(args)) {
        var action = args._.shift(0),
            actionName = availableActions.filter(function (a) {
                return a.name === action;
            })[0].action;

        require(actionName)(args)
            .done(actionSuccess, actionError(action, options));
    } else {
        var unknownCmd = util.format(
            'Tarifa does not know command \'%s\'\n',
            args._.join(' ')
        );

        printHelp(args._.length && unknownCmd);
    }
}

if(require.main === module) {
    main(argv);
} else {
    module.exports = main;
}
