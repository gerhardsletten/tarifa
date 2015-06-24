var chalk = require('chalk'),
    log = require('./log');

module.exports = function banner() {
    log.send(
        'banner',
        chalk.red('  ___       ___    ') + chalk.green('   ___       ___    ') + chalk.magenta('   ___       ___   ') + '\n' +
        chalk.red(' /\   \\     /\\  \\   ') + chalk.green('  /\\  \\     /\\  \\   ') + chalk.magenta('  /\\  \\     /\\  \\  ') + '\n' +
        chalk.red(' \\:\\  \\   /::\\  \\  ') + chalk.green(' /::\\  \\   _\\:\\  \\  ') + chalk.magenta(' /::\\  \\   /::\\  \\ ') + '\n' +
        chalk.red(' /::\\__\\ /::\\:\\__\\ ') + chalk.green('/::\\:\\__\\ /\\/::\\__\\ ') + chalk.magenta('/::\\:\\__\\ /::\\:\\__\\') + '\n' +
        chalk.red('/:/\\/__/ \\/\\::/  / ') + chalk.green('\\;:::/  / \\::/\\/__/ ') + chalk.magenta('\\/\\:\\/__/ \\/\\::/  /') + '\n' +
        chalk.red('\\/__/      /:/  /  ') + chalk.green(' |:\\/__/   \\:\\__\\   ') + chalk.magenta('   \\/__/    /:/  / ') + '\n' +
        chalk.red('           \\/__/   ') + chalk.green('  \\|__|     \\/__/   ') + chalk.magenta('            \\/__/  ')
    );
};
