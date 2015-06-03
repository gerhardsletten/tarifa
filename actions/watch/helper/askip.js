var os = require('os'),
    ask = require('../../../lib/questions/ask');

module.exports = function askHostIp() {
    var interfaces = os.networkInterfaces(),
        ipv4Filter = function (addr) { return addr.family === 'IPv4'; },
        addrFilter = function (i) { return i.address; },
        concat = function (acc, i) { return acc.concat(i); },
        ips = Object.keys(interfaces).map(function (i) {
            return interfaces[i].filter(ipv4Filter).map(addrFilter);
        }).reduce(concat, []);
    return ask.question('Which ip should be used to serve the configuration?', 'list', ips);
};
