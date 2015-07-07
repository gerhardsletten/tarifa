var path = require('path'),
    dir = __dirname;

module.exports.commands = [
    {
        def: ['ios', 'devices', 'list', '*'],
        action: function (_) {
            return require(path.join(dir, 'devices')).list(_[3]);
        }
    },
    {
        def: ['ios', 'devices', 'add', '+', '+'],
        action: function (_) {
            return require(path.join(dir, 'devices')).add(_[3], _[4]);
        }
    },
    {
        def: ['ios', 'devices', 'attach', '+', '+'],
        action: function (_) {
            return require(path.join(dir, 'devices')).attach(_[3], _[4]);
        }
    },
    {
        def: ['ios', 'devices', 'detach', '+', '+'],
        action: function (_) {
            return require(path.join(dir, 'devices')).detach(_[3], _[4]);
        }
    },
    {
        def: ['provisioning', 'list'],
        action: function () {
            return require(path.join(dir, 'provisioning')).list();
        }
    },
    {
        def: ['provisioning', 'fetch'],
        action: function () {
            return require(path.join(dir, 'provisioning')).fetch();
        }
    },
    {
        def: ['provisioning', 'info', '*'],
        action: function (_) {
            return require(path.join(dir, 'provisioning')).info(_[2]);
        }
    }
];
