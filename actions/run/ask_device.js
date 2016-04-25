var Q = require('q'),
    devices = require('../../lib/devices'),
    ask = require('../../lib/questions/ask');

module.exports = function (conf) {
    if(!devices.isSupported(conf.platform)) return Q(conf);

    return devices.list(conf.platform).then(function (items) {
        if (items.length === 0) return Q.reject('No device available!');

        var ids = items.map(function (item, idx) {
            return { value: item.id, index: idx };
        });
        if (ids.length === 1) {
            conf.device = ids[0];
            return Q(conf);
        }

        if (conf.all) {
            conf.devices = ids;
            return Q(conf);
        }

        var findDeviceIndex = function(device) {
            return ids.findIndex(function(x) { return x.value == device; });
        };

        if (conf.device && findDeviceIndex(conf.device) > -1) {
            conf.device = {
                value: conf.device,
                index: findDeviceIndex(conf.device)
            };
            return Q(conf);
        }

        clearInterval(conf.spinner);
        return ask.question(
            'Which device do you want to use?',
            'list',
            (conf.log || (conf.platform === 'ios')) ? ids : ['all'].concat(ids)
        ).then(function (resp) {
            conf.device = {
                value: resp,
                index: findDeviceIndex(resp)
            };
            return conf;
        });
    });
};
