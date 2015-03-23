/*
 * print.js
 */
var util = require('util'),
    figures = require('figures'),
    chalk = require('chalk');

function print (/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(util.format.apply(this, args));
}

function trace (err) {
    console.log(chalk.red(err.stack || err));
}

function todo(/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(chalk.bgYellow.blue('TODO'), ' ', util.format.apply(this, args));
}

function info(/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(chalk.green(figures.info), ' ', util.format.apply(this, args));
}

function success(/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(chalk.green(figures.star), ' ', util.format.apply(this, args));
}

function outline(/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(chalk.yellow.underline(util.format.apply(this, args)));
}

function error(/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(chalk.red(figures.cross), ' ', util.format.apply(this, args));
}

function warning(/* format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(chalk.bgYellow(chalk.black('warning')), ' ', util.format.apply(this, args));
}

function banner() {
    print(
chalk.red('  ___       ___    ') + chalk.green('   ___       ___    ') + chalk.magenta('   ___       ___   ') + '\n' +
chalk.red(' /\   \\     /\\  \\   ') + chalk.green('  /\\  \\     /\\  \\   ') + chalk.magenta('  /\\  \\     /\\  \\  ') + '\n' +
chalk.red(' \\:\\  \\   /::\\  \\  ') + chalk.green(' /::\\  \\   _\\:\\  \\  ') + chalk.magenta(' /::\\  \\   /::\\  \\ ') + '\n' +
chalk.red(' /::\\__\\ /::\\:\\__\\ ') + chalk.green('/::\\:\\__\\ /\\/::\\__\\ ') + chalk.magenta('/::\\:\\__\\ /::\\:\\__\\') + '\n' +
chalk.red('/:/\\/__/ \\/\\::/  / ') + chalk.green('\\;:::/  / \\::/\\/__/ ') + chalk.magenta('\\/\\:\\/__/ \\/\\::/  /') + '\n' +
chalk.red('\\/__/      /:/  /  ') + chalk.green(' |:\\/__/   \\:\\__\\   ') + chalk.magenta('   \\/__/    /:/  / ') + '\n' +
chalk.red('           \\/__/   ') + chalk.green('  \\|__|     \\/__/   ') + chalk.magenta('            \\/__/  ')
    );
}

module.exports = print;
module.exports.trace = trace;
module.exports.info = info;
module.exports.success = success;
module.exports.error = error;
module.exports.warning = warning;
module.exports.banner = banner;
module.exports.outline = outline;
module.exports.todo = todo;
