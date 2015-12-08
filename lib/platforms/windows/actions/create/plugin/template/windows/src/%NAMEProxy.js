module.exports = {
    toUpper : function (win, fail, args) {
        win(args[0].toUpperCase());
    }
};

require('cordova/exec/proxy').add('%NAME', module.exports);
