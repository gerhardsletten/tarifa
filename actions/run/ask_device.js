var Q = require('q'),
    format = require('util').format,
    devices = require('../../lib/devices'),
    ask = require('../../lib/questions/ask');

module.exports = function (conf) {
    if(!devices[conf.platform]) return conf;

    return devices[conf.platform].info().then(function (items) {
        if (items.length === 0) return Q.reject("No device available!");

        if (items.length === 1) {
            conf.device = { value: items[0], index : 0 };
            return conf;
        }

        return ask.question(
            'Which device do you want to use?',
            'list',
            conf.debug ? items : ['all'].concat(items)
        ).then(function (resp) {
            if(resp !== 'all')
                conf.device = { value: resp, index : items.indexOf(resp) };
            else
                conf.devices = items;
            return conf;
        });
    });
};
