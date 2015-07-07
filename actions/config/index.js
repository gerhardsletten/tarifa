var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    match = require('../../lib/helper/args').matchCmd,
    settings = require('../../lib/settings'),
    platformCommands = [ ];

settings.platforms.forEach(function (p) {
    var mod = path.resolve(__dirname, '../../lib/platforms', p, 'actions/config');
    platformCommands = platformCommands.concat(require(mod).commands);
});

function usage() {
    return fs.read(path.join(__dirname, 'usage.txt')).then(function (msg) {
        return settings.platforms.reduce(function (text, platform) {
            var usagePath = path.resolve(__dirname, '../../lib/platforms', platform, 'actions/config/usage.txt');
            return Q.when(text, function (t) {
                return fs.read(usagePath).then(function (u) {
                    return t + u;
                });
            });
        }, msg);
    }).then(console.log);
}

var action = function (argv) {
    if(argsHelper.checkValidOptions(argv, [])) {

        if(match(argv._, ['icons', 'generate', '+', '*']))
            return action.generateIcons(argv._[2], argv._[3]);
        if(match(argv._, ['icons', 'file', '+', '*']))
            return action.generateIconsFromFile(pathHelper.resolve(argv._[2]), argv._[3]);
        if(match(argv._, ['splashscreens', '+', '*']))
            return action.generateSplashscreens(argv._[1], argv._[2]);

        for(var i = 0, l = platformCommands.length; i < l; i++) {
            if(match(argv._, platformCommands[i].def))
                return platformCommands[i].action(argv._);
        }
        return usage();
    }
    return usage();
};

action.generateIcons = function (color, config) {
    return require('./assets').generateIcons(color, config);
};

action.generateIconsFromFile = function (filePath, config) {
    return require('./assets').generateIconsFromFile(filePath, config);
};

action.generateSplashscreens = function (color, config) {
    return require('./assets').generateSplashscreens(color, config);
};

module.exports = action;
