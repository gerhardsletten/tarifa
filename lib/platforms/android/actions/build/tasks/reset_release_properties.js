var log = require('../../../../../helper/log'),
    releaseProperties = require('../../../lib/release-properties');

module.exports = function (msg) {
    return releaseProperties.remove(process.cwd()).then(function () {
        log.send('success', '[android] release.properties deleted');
        return msg;
    });
};
