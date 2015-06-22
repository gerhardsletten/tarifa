var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    chalk = require('chalk'),
    figures = require('figures'),
    emitter = new EventEmitter();

emitter.send = function (/* type, format, [ args ... ]*/) {
    var args = Array.prototype.slice.call(arguments, 0),
        msg = "";

    if(args[0] == 'outline') {
        msg = chalk.yellow.underline(util.format.apply(this, args.splice(1)));
        emitter.emit(args[0], msg);
        return;
    }

    switch(args[0]) {
        case 'success':
            msg = chalk.green(figures.star);
            break;
        case 'info':
            msg = chalk.green(figures.info);
            break;
        case 'error':
            msg = chalk.red(figures.cross);
            break;
        case 'warning':
            msg = chalk.bgYellow(chalk.black('warning'));
            break;
    }

    msg += (args[0] == 'msg' ? '' : '  ') + util.format.apply(this, args.splice(1));
    emitter.emit(args[0], msg);
};

emitter.init = function (verbose) {
    emitter.on('msg', console.log);
    emitter.on('error', console.log);
    emitter.on('warning', console.log);
    emitter.on('outline', console.log);
    if(verbose) {
        emitter.on('success', console.log);
        emitter.on('info', console.log);
    }
};

module.exports = emitter;
