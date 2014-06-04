#!/usr/bin/env node

var argv = process.argv.slice(2),
    fs = require('fs'),
    path = require('path'),
    args = require('minimist')(argv),
    pkg = require('../package.json'),
    create = require('../actions/create'),
    info = require('../actions/info');

var availableActions = [
        { name : 'create', action : create },
        { name : 'info', action : info }
    ],
    singleOptions = [
        { small: 'v', name : 'version', action : printVersion },
        { small: 'h', name : 'help', action : printHelp }
    ];

function printHelp(errMessage) {
    if(errMessage) console.log(errMessage);
    console.log(fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf-8'));
    process.exit(0);
}

function printVersion() {
    console.log(pkg.version);
    process.exit(0);
}

function matchSingleOptions(arg, s, l) {
    return (arg[s] == true || arg[l] == true) && arg._.length == 0 && arg.length != 2;
}

function matchAction(arg) {
    return arg._[0] && availableActions.map(function (a) { return a.name; }).indexOf(arg._[0]) >=0;
}

function actionSuccess(val) { }
function actionError(err) { console.log(err); }

function main(arg) {
    singleOptions.forEach(function (option) {
        if(matchSingleOptions(arg, option.small, option.name)) option.action();
    });

    if(matchAction(arg)) {
        availableActions
            .filter(function (a) { return a.name == arg._[0]; })[0].action(arg)
            .done(actionSuccess, actionError);
    } else {
        printHelp(argv.length && "Tarifa does not know " + argv.join(' ') + '\n');
    }
}

main(args);
