var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    osPlatform = require('os').platform(),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    match = require('../../lib/helper/args').matchCmd,
    settings = require('../../lib/settings'),
    platformCommands = [ ],
    supportedPlatforms = settings.platforms.filter(function (platform) {
        return settings.os_platforms[platform].indexOf(osPlatform) > -1;
    }),
    platformActionPath = function (p) {
        return path.resolve(__dirname, '../../lib/platforms', p, 'actions/config');
    };

supportedPlatforms.forEach(function (p) {
    platformCommands = platformCommands.concat(require(platformActionPath(p)).commands);
});

function usage() {
    var add = function (s1) { return function (s2) { return s1 + s2; } },
        mainText = fs.read(path.join(__dirname, 'usage.txt'));
    return mainText.then(function (msg) {
        return supportedPlatforms.reduce(function (text, platform) {
            var usagePath = path.resolve(platformActionPath(platform), 'usage.txt');
            return Q.when(text, function (t) {
                return fs.read(usagePath).then(add(t));
            });
        }, msg);
    }).then(console.log);
}

var action = function (argv) {
    if(argsHelper.checkValidOptions(argv, ['bgColor'])) {
        var bgColor = argsHelper.matchOptionWithValue(argv, null, 'bgColor') && argv.bgColor;
        if(match(argv._, ['icons', 'generate', '+', '*']))
            return action.generateIcons(argv._[2], argv._[3]);
        if(match(argv._, ['icons', 'file', '+', '*']))
            return action.generateIconsFromFile(pathHelper.resolve(argv._[2]), argv._[3], bgColor);
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

action.generateIconsFromFile = function (filePath, config, color) {
    return require('./assets').generateIconsFromFile(filePath, config, color);
};

action.generateSplashscreens = function (color, config) {
    return require('./assets').generateSplashscreens(color, config);
};

module.exports = action;
