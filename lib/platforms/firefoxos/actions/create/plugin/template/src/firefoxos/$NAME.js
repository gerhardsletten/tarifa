module.exports = {
    life: function (success, error, args) {
        setTimeout(function () {
            success(args[0].toUpperCase());
        });
    }
};

cordova.commandProxy.add('$NAME', module.exports);
