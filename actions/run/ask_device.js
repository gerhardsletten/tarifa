var Q = require('q'),
    devices = require('../../lib/devices'),
    ask = require('../../lib/questions/ask');

module.exports = function (conf) {
    if(!devices.isSupported(conf.platform)) return conf;

    return devices.list(conf.platform).then(function (items) {
        if (items.length === 0) return Q.reject('No device available!');

        var ids = items.map(function (item, idx) {
            return { value: item.id, index: idx };
        });
        if (ids.length === 1) {
            conf.device = ids[0];
            return conf;
        }

        if (conf.all) {
            conf.devices = ids;
            return conf;
        }

        clearInterval(conf.spinner);

        return ask.question(
            'Which device do you want to use?',
            'list',
            conf.log ? ids : ['all'].concat(ids)
        ).then(function (resp) {
            if (resp !== 'all')
                conf.device = {
                    value: resp,
                    index: ids.indexOf(resp)
                };
            else
                conf.devices = ids;
            return conf;
        });
    });
};
