var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    log = require('../../../../../helper/log'),
    mergeObject = require('../../../../../helper/collections').mergeObject,
    ConfigBuilder = require('../../../../../xml/config.xml');

module.exports = function (msg) {
    var config_xml_path = path.join(pathHelper.app(), 'config.xml');
    return ConfigBuilder.setName(
        config_xml_path,
        msg.localSettings.name
    ).then(function () {
        log.send('success', 'undo rename project in config.xml');
        return msg;
    }, function(err) {
        log.send('error', 'Error while undo rename project in config.xml: ' + err);
        return Q.reject(err);
    });
};